/**
 * Controller ManagerLaporan.
 *
 * Sesuai sequence UC04 di DPPL, daftar dan detail lokasi CleanIt diminta lewat ManagerLaporan
 * (`get_daftar_lokasi`, `get_detail_lokasi`) yang membaca model Lokasi. Validasi bisnis laporan
 * C15 (`is_terisi`, `is_format_valid`, `cek_laporan`) mengikuti tugas BE-10.
 *
 * Notifikasi juga lewat sini karena isinya diturunkan dari laporan yang sudah diverifikasi
 * (N8); query-nya ada di model Pengguna sebagai pengganti `notify`.
 *
 * Cek sesi/role dilakukan di route handler sebelum memanggil fungsi di sini.
 *
 * Kelas DPPL: C15 - ManagerLaporan
 */
import { z } from "zod";
import { ApiError, apiSuccess, parseQuery, validateInput } from "@/server/api";
import { zodIssuesToFields } from "@/server/api/errors";
import type { Sesi } from "@/server/auth/guard";
import { diDalamWilayah } from "@/lib/wilayah";
import { db, type Db } from "@/server/db";
import * as LokasiModel from "@/server/models/lokasi";
import * as LaporanModel from "@/server/models/laporan";
import * as MediaModel from "@/server/models/media";
import * as PenggunaModel from "@/server/models/pengguna";
import { getUrl } from "@/server/storage/s3";
import type { JenisSampah, LokasiDetail, Media, OkResponse, Sumber } from "@/types/api";

/** Batas kolom `serial` (int4), supaya ID di luar rentang tidak sampai ke database. */
const MAKS_ID = 2_147_483_647;

const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().max(MAKS_ID)),
});

const daftarLokasiQuerySchema = z.object({
  status: z.enum(["TERCEMAR", "DIBERSIHKAN"]).default("TERCEMAR"),
});

type EksekutorValidasiLaporan = Pick<Db, "select">;

const idsMediaSchema = z
  .array(z.number().int().min(1).max(MAKS_ID))
  .min(1)
  .max(3)
  .refine((ids) => new Set(ids).size === ids.length);

const dasarLaporanSchema = {
  judul: z.string().trim().min(1).max(80),
  waktu: z.iso.datetime(),
  idMedia: idsMediaSchema,
};

const reportItSchema = z.object({
  ...dasarLaporanSchema,
  jenis: z.literal("REPORTIT"),
  lokasi: z.string().trim().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  sumber: z.enum(["PENGAMATAN_PRIBADI", "INFO_WARGA", "MEDIA_SOSIAL", "LAINNYA"]),
  jenisSampah: z.enum(["PLASTIK", "KEMASAN_STYROFOAM", "RUMAH_TANGGA", "ORGANIK", "LAINNYA"]),
});

const cleanItSchema = z.object({
  ...dasarLaporanSchema,
  jenis: z.literal("CLEANIT"),
  lokasiId: z.number().int().min(1).max(MAKS_ID),
});

const laporanMasukSchema = z.discriminatedUnion("jenis", [reportItSchema, cleanItSchema]);

export type LaporanTervalidasi =
  | {
      jenis: "REPORTIT";
      judul: string;
      waktu: Date;
      idMedia: number[];
      idPengguna: string;
      lokasi: string;
      latitude: number;
      longitude: number;
      sumber: Sumber;
      jenisSampah: JenisSampah;
    }
  | { jenis: "CLEANIT"; judul: string; waktu: Date; idMedia: number[]; idPengguna: string; lokasiId: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKosong(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function fieldsBelumTerisi(input: unknown): Record<string, string> {
  if (!isRecord(input)) return {};
  if (isKosong(input.jenis)) return { jenis: "Field wajib diisi." };
  if (input.jenis !== "REPORTIT" && input.jenis !== "CLEANIT") return {};

  const wajib =
    input.jenis === "REPORTIT"
      ? ["judul", "waktu", "lokasi", "latitude", "longitude", "sumber", "jenisSampah", "idMedia"]
      : ["judul", "waktu", "lokasiId", "idMedia"];
  return Object.fromEntries(
    wajib.filter((field) => isKosong(input[field])).map((field) => [field, "Field wajib diisi."]),
  );
}

/** True bila semua field wajib untuk jenis laporan yang dikenal sudah terisi. */
export function is_terisi(input: unknown): boolean {
  if (!isRecord(input)) return false;
  return Object.keys(fieldsBelumTerisi(input)).length === 0;
}

/** Cek format field, rentang koordinat, 1–3 ID media, ISO UTC, dan waktu yang tidak di masa depan. */
export function is_format_valid(input: unknown, sekarang: Date = new Date()): boolean {
  const parsed = laporanMasukSchema.safeParse(input);
  return parsed.success && Date.parse(parsed.data.waktu) <= sekarang.getTime();
}

function formatTidakValid(fields: Record<string, string>): ApiError {
  return new ApiError("FORMAT_TIDAK_VALID", "Format input laporan tidak valid.", fields);
}

async function cekMediaLaporan(
  idMedia: number[],
  idPengguna: string,
  tx: EksekutorValidasiLaporan,
): Promise<void> {
  const daftar = await MediaModel.getUntukLaporan(idMedia, idPengguna, tx);
  if (daftar.length !== idMedia.length) {
    throw formatTidakValid({ idMedia: "Media tidak ditemukan atau bukan milik Anda." });
  }

  if (daftar.some((item) => item.laporanId !== null)) {
    throw new ApiError("MEDIA_SUDAH_DIGUNAKAN", "Salah satu media sudah tertaut ke laporan lain.");
  }

  const hashDiRequest = new Set<string>();
  for (const item of daftar) {
    if (hashDiRequest.has(item.sha256) || (await MediaModel.sudahDipakai(item.sha256, tx))) {
      throw new ApiError("MEDIA_SUDAH_DIGUNAKAN", "Foto atau video ini sudah pernah dipakai di laporan lain.");
    }
    hashDiRequest.add(item.sha256);
  }
}

/**
 * Validasi bisnis C15 untuk ReportIt/CleanIt. Untuk CleanIt, BE-11 harus memanggilnya di dalam
 * transaksi pembuatan laporan agar `FOR SHARE` pada lokasi tetap terkunci sampai insert selesai.
 */
export async function cek_laporan(
  input: unknown,
  idPengguna: string,
  tx: EksekutorValidasiLaporan = db,
  sekarang: Date = new Date(),
): Promise<LaporanTervalidasi> {
  const fieldsWajib = fieldsBelumTerisi(input);
  if (Object.keys(fieldsWajib).length > 0) {
    throw new ApiError("DATA_TIDAK_LENGKAP", "Data wajib laporan belum lengkap.", fieldsWajib);
  }

  const parsed = laporanMasukSchema.safeParse(input);
  if (!parsed.success) {
    throw formatTidakValid(zodIssuesToFields(parsed.error));
  }
  if (Date.parse(parsed.data.waktu) > sekarang.getTime()) {
    throw formatTidakValid({ waktu: "Waktu laporan tidak boleh di masa depan." });
  }

  if (parsed.data.jenis === "REPORTIT") {
    if (!diDalamWilayah(parsed.data.latitude, parsed.data.longitude)) {
      throw new ApiError("DI_LUAR_WILAYAH", "Lokasi berada di luar wilayah kerja sama SoClean.");
    }
  } else {
    const lokasi = await LokasiModel.getUntukValidasiCleanIt(parsed.data.lokasiId, tx);
    if (!lokasi) throw new ApiError("NOT_FOUND", "Lokasi tidak ditemukan.");
    if (lokasi.status !== "TERCEMAR") {
      throw new ApiError("LOKASI_SUDAH_DIBERSIHKAN", "Lokasi sudah dibersihkan.");
    }
    if (await LaporanModel.adaCleanItMenunggu(idPengguna, parsed.data.lokasiId, tx)) {
      throw new ApiError("CLEANIT_SUDAH_MENUNGGU", "Anda masih memiliki CleanIt yang menunggu untuk lokasi ini.");
    }
    if (Date.parse(parsed.data.waktu) < lokasi.waktuKejadianAsal.getTime()) {
      throw formatTidakValid({ waktu: "Waktu pembersihan tidak boleh sebelum waktu laporan asal." });
    }
    // Tidak ada larangan ketika pelapor CleanIt sama dengan pelapor asal lokasi (Aturan CleanIt 6).
  }

  await cekMediaLaporan(parsed.data.idMedia, idPengguna, tx);

  if (parsed.data.jenis === "REPORTIT") {
    return { ...parsed.data, idPengguna, waktu: new Date(parsed.data.waktu) };
  }
  return { ...parsed.data, idPengguna, waktu: new Date(parsed.data.waktu) };
}

/** Ubah `storage_key` media menjadi presigned URL (BE-07). */
async function keMedia(daftar: LokasiModel.MediaTersimpan[]): Promise<Media[]> {
  return Promise.all(
    daftar.map(async ({ idMedia, tipe, storageKey, createdAt }) => ({
      idMedia,
      url: await getUrl(storageKey),
      tipe,
      createdAt,
    })),
  );
}

/** GET /api/lokasi — UC04, I-09/I-10. Default status TERCEMAR, tanpa filter radius (N11). */
export async function get_daftar_lokasi(request: Request): Promise<Response> {
  const { status } = await parseQuery(request, daftarLokasiQuerySchema);
  const daftar = await LokasiModel.get_all_lokasi_valid(status);
  return apiSuccess(daftar);
}

/** GET /api/lokasi/:id — UC04, detail lokasi beserta laporan asal (KF07). */
export async function get_detail_lokasi(idParam: string): Promise<Response> {
  const { id } = await validateInput({ id: idParam }, idParamSchema);

  const lokasi = await LokasiModel.get_lokasi(id);
  if (!lokasi) {
    throw new ApiError("NOT_FOUND", "Lokasi tidak ditemukan.");
  }

  const detail: LokasiDetail = {
    ...lokasi,
    laporanAsal: { ...lokasi.laporanAsal, media: await keMedia(lokasi.laporanAsal.media) },
  };
  return apiSuccess(detail);
}

/** GET /api/notifikasi — notifikasi hasil verifikasi laporan milik pengguna (C08 `notify`). */
export async function getNotifikasi(sesi: Sesi): Promise<Response> {
  const daftar = await PenggunaModel.getNotifikasi(sesi.idPengguna);
  return apiSuccess(daftar);
}

/** POST /api/notifikasi/dibaca — set `notifikasi_dilihat_at` = sekarang. */
export async function tandaiNotifikasiDibaca(sesi: Sesi): Promise<Response> {
  const berhasil = await PenggunaModel.tandaiNotifikasiDibaca(sesi.idPengguna);
  if (!berhasil) {
    // Cookie valid, tetapi akunnya sudah tidak ada.
    throw new ApiError("UNAUTHORIZED", "Sesi tidak valid. Silakan login kembali.");
  }
  const data: OkResponse = { ok: true };
  return apiSuccess(data);
}

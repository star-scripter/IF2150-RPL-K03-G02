/**
 * Controller ManagerLaporan.
 *
 * Sesuai sequence UC04 di DPPL, daftar dan detail lokasi CleanIt diminta lewat ManagerLaporan
 * (`get_daftar_lokasi`, `get_detail_lokasi`) yang membaca model Lokasi. Operasi laporan lain
 * milik C15 (`cek_laporan`, `get_detail`, dst.) ditambahkan oleh tugas BE-A/BE-B terkait.
 *
 * Cek sesi/role dilakukan di route handler sebelum memanggil fungsi di sini.
 *
 * Kelas DPPL: C15 - ManagerLaporan
 */
import { z } from "zod";
import { ApiError, apiSuccess, parseQuery, validateInput } from "@/server/api";
import * as LokasiModel from "@/server/models/lokasi";
import { getUrl } from "@/server/storage";
import type { LokasiDetail, Media } from "@/types/api";

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

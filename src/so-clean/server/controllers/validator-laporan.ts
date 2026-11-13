/**
 * Controller ValidatorLaporan — verifikasi laporan oleh Operator (UC03, UC06).
 *
 * `get_detail` menyusun `LaporanDetail` untuk I-08. Untuk ReportIt yang menunggu, detail memuat
 * lokasi TERCEMAR terdekat dalam radius 50 m yang akan menjadi tujuan penggabungan (K13). Untuk
 * CleanIt, detail memuat laporan asal lokasi (galeri Sebelum, N9) dan tanda pelapor asal
 * (Aturan CleanIt nomor 6). Data laporan dibaca lewat helper ManagerLaporan (C15).
 *
 * `setujui` (Algo-001) berjalan dalam satu transaksi lewat ManagerLaporan (N14): `ubah_status`
 * bersyarat (BE-16), lalu untuk ReportIt `petakan_lokasi` (BE-13). Pelapor ReportIt tidak mendapat
 * poin (N1).
 *
 * Cek sesi/role Operator dilakukan di route handler.
 *
 * Kelas DPPL: C05 - ValidatorLaporan
 */
import { z } from "zod";
import { ApiError, apiSuccess, validateInput } from "@/server/api";
import type { Sesi } from "@/server/auth/guard";
import * as ManagerLaporan from "@/server/controllers/manager-laporan";
import { db } from "@/server/db";
import * as LaporanModel from "@/server/models/laporan";
import * as LokasiModel from "@/server/models/lokasi";
import * as MediaModel from "@/server/models/media";
import * as PenggunaModel from "@/server/models/pengguna";
import type { LaporanDetail, SetujuiLaporanResponse } from "@/types/api";

/** Body setujui ReportIt (K3, K9). Nama kosong/spasi memakai teks lokasi laporan. */
const setujuiReportItSchema = z.object({
  poin: z.union([z.literal(50), z.literal(100), z.literal(200)]).default(50),
  namaLokasi: z.string().trim().max(255).optional(),
});

/** Baca body JSON yang boleh kosong (dianggap `{}`); JSON rusak → 400 FORMAT_TIDAK_VALID. */
async function bacaBodyOpsional(request: Request): Promise<unknown> {
  const teks = await request.text();
  if (teks.trim() === "") return {};
  try {
    return JSON.parse(teks);
  } catch {
    throw new ApiError("FORMAT_TIDAK_VALID", "Body request harus berupa JSON yang valid.", {
      body: "Body request harus berupa JSON yang valid.",
    });
  }
}

/** Laporan harus ada dan masih BELUM_DIPERIKSA sebelum body divalidasi (urutan sama dengan mock FE-04). */
async function wajibMenunggu(idLaporan: number): Promise<LaporanModel.LaporanTersimpan> {
  const laporan = await LaporanModel.getLaporanById(idLaporan);
  if (!laporan) {
    throw new ApiError("NOT_FOUND", "Laporan tidak ditemukan.");
  }
  if (laporan.status !== "BELUM_DIPERIKSA") {
    throw new ApiError("SUDAH_DIVERIFIKASI", "Laporan sudah diverifikasi oleh Operator lain.");
  }
  return laporan;
}

/** Field khusus CleanIt di `LaporanDetail`. */
type DetailCleanIt = Pick<
  LaporanDetail,
  "laporanAsal" | "pelaporAsalSama" | "jumlahBersihkanSendiri30Hari"
>;

/** GET /api/laporan/:id — get_detail(idLaporan) untuk I-08. */
export async function get_detail(idParam: string): Promise<Response> {
  const idLaporan = await ManagerLaporan.bacaIdParam(idParam);

  const laporan = await LaporanModel.getLaporanById(idLaporan);
  if (!laporan) {
    throw new ApiError("NOT_FOUND", "Laporan tidak ditemukan.");
  }

  const [pelapor, daftarMedia] = await Promise.all([
    PenggunaModel.getMe(laporan.idPengguna),
    MediaModel.getByLaporan(laporan.idLaporan),
  ]);
  if (!pelapor) {
    // FK laporan.id_pengguna menjamin pelapor selalu ada.
    throw new Error(`Pelapor laporan ${laporan.idLaporan} tidak ditemukan.`);
  }

  let dasar: ReturnType<typeof ManagerLaporan.keLaporan>;
  let lokasiTerdekat: LaporanDetail["lokasiTerdekat"] = null;
  let detailCleanIt: DetailCleanIt = {
    laporanAsal: null,
    pelaporAsalSama: null,
    jumlahBersihkanSendiri30Hari: null,
  };

  if (laporan.jenis === "REPORTIT") {
    dasar = ManagerLaporan.keLaporan(laporan);
    if (laporan.status === "BELUM_DIPERIKSA") {
      const terdekat = await LokasiModel.cariTerdekatTercemar(dasar.latitude, dasar.longitude);
      lokasiTerdekat = terdekat && {
        idLokasi: terdekat.idLokasi,
        nama: terdekat.nama,
        jarakMeter: Math.round(terdekat.jarakMeter),
      };
    }
  } else {
    if (laporan.lokasiId === null) {
      // Dijaga CHECK laporan_field_per_jenis_check: CleanIt selalu punya lokasi_id.
      throw new Error(`CleanIt ${laporan.idLaporan} tidak memiliki lokasi.`);
    }
    const [lokasi, pelaporAsal, jumlahBersihkanSendiri30Hari] = await Promise.all([
      LokasiModel.get_lokasi(laporan.lokasiId),
      LokasiModel.getPelaporAsal(laporan.lokasiId),
      LaporanModel.hitungBersihkanSendiri30Hari(laporan.idPengguna, laporan.idLaporan),
    ]);
    if (!lokasi) {
      throw new Error(`Lokasi ${laporan.lokasiId} untuk CleanIt ${laporan.idLaporan} tidak ditemukan.`);
    }

    dasar = ManagerLaporan.keLaporan(laporan, lokasi);
    detailCleanIt = {
      laporanAsal: {
        idLaporan: lokasi.laporanAsal.idLaporan,
        judul: lokasi.laporanAsal.judul,
        waktu: lokasi.laporanAsal.waktu,
        media: await ManagerLaporan.keMedia(lokasi.laporanAsal.media),
      },
      pelaporAsalSama: pelaporAsal === laporan.idPengguna,
      jumlahBersihkanSendiri30Hari,
    };
  }

  const detail: LaporanDetail = {
    ...dasar,
    media: await ManagerLaporan.keMedia(daftarMedia),
    pelapor: { id: pelapor.id, nama: pelapor.nama },
    lokasiId: laporan.lokasiId,
    alasanPenolakan: laporan.alasanPenolakan,
    lokasiTerdekat,
    ...detailCleanIt,
  };
  return apiSuccess(detail);
}

/**
 * POST /api/laporan/:id/setujui — setujui(idLaporan), Algo-001.
 * ReportIt: status VALID lalu dipetakan ke lokasi baru atau lokasi dalam radius 50 m (BE-13).
 */
export async function setujui(request: Request, idParam: string, sesi: Sesi): Promise<Response> {
  const idLaporan = await ManagerLaporan.bacaIdParam(idParam);
  const laporan = await wajibMenunggu(idLaporan);
  const body = await bacaBodyOpsional(request);

  if (laporan.jenis !== "REPORTIT") {
    // Persetujuan CleanIt (poin dan lokasi DIBERSIHKAN) ditambahkan di BE-14.
    throw new Error("Persetujuan CleanIt belum tersedia.");
  }

  const { poin, namaLokasi } = await validateInput(body, setujuiReportItSchema);
  const data = await db.transaction(async (tx): Promise<SetujuiLaporanResponse> => {
    const terverifikasi = await ManagerLaporan.ubah_status(
      idLaporan,
      { status: "VALID", diverifikasiOleh: sesi.idPengguna },
      tx,
    );
    const { idLokasi, digabung } = await ManagerLaporan.petakan_lokasi(
      terverifikasi,
      { poin, namaLokasi: namaLokasi || undefined },
      tx,
    );
    return { idLaporan, status: "VALID", idLokasi, digabung };
  });
  return apiSuccess(data);
}

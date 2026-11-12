/**
 * Controller ValidatorLaporan — verifikasi laporan oleh Operator (UC03, UC06).
 *
 * `get_detail` menyusun `LaporanDetail` untuk I-08. Untuk ReportIt yang menunggu, detail memuat
 * lokasi TERCEMAR terdekat dalam radius 50 m yang akan menjadi tujuan penggabungan (K13). Untuk
 * CleanIt, detail memuat laporan asal lokasi (galeri Sebelum, N9) dan tanda pelapor asal
 * (Aturan CleanIt nomor 6). Data laporan dibaca lewat helper ManagerLaporan (C15).
 *
 * Cek sesi/role Operator dilakukan di route handler.
 *
 * Kelas DPPL: C05 - ValidatorLaporan
 */
import { ApiError, apiSuccess } from "@/server/api";
import * as ManagerLaporan from "@/server/controllers/manager-laporan";
import * as LaporanModel from "@/server/models/laporan";
import * as LokasiModel from "@/server/models/lokasi";
import * as MediaModel from "@/server/models/media";
import * as PenggunaModel from "@/server/models/pengguna";
import type { LaporanDetail } from "@/types/api";

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

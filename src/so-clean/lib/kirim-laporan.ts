/** FE-12: payload dan pemetaan kegagalan pengiriman, tanpa mengubah state form. */
import { ApiError } from "@/lib/api/client";
import { mediaSiapDikirim } from "@/lib/bukti-media";
import type { BagianLaporan, StateFormLaporan } from "@/lib/form-laporan";
import { validasiInformasiDasar, waktuWibKeIso } from "@/lib/informasi-dasar";
import type { BuatLaporanRequest, BuatLaporanResponse, JenisSampah, Sumber } from "@/types/api";

export type ErrorBagianLaporan = Partial<Record<BagianLaporan, string[]>>;
export type KegagalanKirim = {
  pesan: string;
  bagian: ErrorBagianLaporan;
  pilihLokasiLain?: boolean;
};
type PersiapanKirim = { valid: true; payload: BuatLaporanRequest } | { valid: false; error: KegagalanKirim };
const MAKS_ID = 2_147_483_647;
const idValid = (id: unknown): id is number => typeof id === "number" && Number.isInteger(id) && id > 0 && id <= MAKS_ID;

function bagianField(field: string): BagianLaporan | null {
  switch (field.split(/[.\[]/)[0]) {
    case "judul": return "judul";
    case "lokasi": case "lokasiId": case "latitude": case "longitude": case "koordinat": return "lokasi";
    case "waktu": return "waktu";
    case "sumber": return "sumber";
    case "jenisSampah": return "jenisSampah";
    case "idMedia": case "media": return "media";
    default: return null;
  }
}

function tambahError(bagian: ErrorBagianLaporan, key: BagianLaporan, pesan: string) {
  const daftar = bagian[key] ??= [];
  if (!daftar.includes(pesan)) daftar.push(pesan);
}

/** Selalu baca pilihan terkini, bukan cache ID dari unggahan yang sudah dihapus. */
export function siapkanKirimLaporan(state: StateFormLaporan, sekarang = new Date()): PersiapanKirim {
  const { informasi, konfigurasi, media } = state;
  const bagian: ErrorBagianLaporan = {};
  const validasi = validasiInformasiDasar(informasi, sekarang);
  for (const [field, pesan] of Object.entries(validasi.fields)) {
    if (konfigurasi.jenis === "CLEANIT" && field !== "judul" && field !== "waktu") continue;
    const key = bagianField(field);
    if (key) tambahError(bagian, key, pesan);
  }
  if (konfigurasi.jenis === "CLEANIT" && !idValid(konfigurasi.lokasiId)) {
    tambahError(bagian, "lokasi", "Lokasi pembersihan tidak valid. Pilih kembali lokasi yang akan dibersihkan.");
  }
  if (!mediaSiapDikirim(media) || media.some((item) => !idValid(item.unggahan?.idMedia))) {
    tambahError(bagian, "media", "Tambahkan 1–3 bukti dan tunggu hingga semua unggahan berhasil. Hapus atau unggah ulang bukti yang gagal.");
  }
  if (Object.keys(bagian).length) {
    return { valid: false, error: { pesan: "Periksa kembali bagian yang ditandai sebelum mengirim laporan.", bagian } };
  }
  const dasar = {
    judul: informasi.judul.trim(),
    waktu: waktuWibKeIso(informasi.waktu)!,
    idMedia: media.map((item) => item.unggahan!.idMedia),
  };
  return { valid: true, payload: konfigurasi.jenis === "CLEANIT"
    ? { ...dasar, jenis: "CLEANIT", lokasiId: konfigurasi.lokasiId }
    : { ...dasar, jenis: "REPORTIT", lokasi: informasi.lokasi.trim(), latitude: informasi.latitude!, longitude: informasi.longitude!, sumber: informasi.sumber as Sumber, jenisSampah: informasi.jenisSampah as JenisSampah } };
}

/** Jangan menghapus draf hanya karena HTTP 2xx; isi respons harus sesuai kontrak BE-11. */
export function hasilKirimValid(value: unknown): value is BuatLaporanResponse {
  if (!value || typeof value !== "object") return false;
  const hasil = value as Partial<BuatLaporanResponse>;
  return idValid(hasil.idLaporan) && hasil.status === "BELUM_DIPERIKSA";
}

export function kegagalanKirimLaporan(error: unknown): KegagalanKirim {
  const apiError = error instanceof ApiError ? error : new ApiError("INTERNAL_ERROR", 0);
  const bagian: ErrorBagianLaporan = {};
  for (const [field, pesan] of Object.entries(apiError.fields ?? {})) {
    const key = bagianField(field);
    if (key) tambahError(bagian, key, pesan);
  }
  if (apiError.code === "DI_LUAR_WILAYAH") tambahError(bagian, "lokasi", "Pilih titik di wilayah kerja sama SoClean melalui Ubah Informasi Lokasi.");
  if (apiError.code === "MEDIA_SUDAH_DIGUNAKAN") tambahError(bagian, "media", "Hapus bukti yang pernah digunakan, lalu unggah foto atau video lain melalui Ubah Bukti Media.");
  return {
    pesan: apiError.message,
    bagian,
    pilihLokasiLain: apiError.code === "LOKASI_SUDAH_DIBERSIHKAN" || apiError.code === "CLEANIT_SUDAH_MENUNGGU" || apiError.code === "NOT_FOUND",
  };
}

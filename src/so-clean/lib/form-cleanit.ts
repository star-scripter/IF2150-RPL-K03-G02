/** FE-17: aturan informasi CleanIt; dipakai di I-11 dan pemeriksaan akhir FE-12. */
import type { InformasiLaporan } from "@/lib/form-laporan";
import { waktuWibKeIso } from "@/lib/informasi-dasar";
import { MAKS_JUDUL } from "@/lib/judul";

export type ErrorInformasiCleanIt = Partial<Record<"judul" | "waktu", string>>;

export function validasiInformasiCleanIt(
  informasi: Pick<InformasiLaporan, "judul" | "waktu">,
  waktuKejadianAsal: string | undefined,
  sekarang = new Date(),
): { valid: boolean; fields: ErrorInformasiCleanIt } {
  const fields: ErrorInformasiCleanIt = {};
  if (!informasi.judul.trim()) fields.judul = "Judul laporan wajib diisi.";
  else if (informasi.judul.trim().length > MAKS_JUDUL) fields.judul = `Judul laporan maksimal ${MAKS_JUDUL} karakter.`;

  const waktu = waktuWibKeIso(informasi.waktu);
  if (!informasi.waktu.trim()) fields.waktu = "Waktu pembersihan wajib diisi.";
  else if (!waktu) fields.waktu = "Pilih tanggal dan waktu pembersihan yang valid.";
  else if (Date.parse(waktu) > sekarang.getTime()) fields.waktu = "Waktu pembersihan tidak boleh di masa depan.";
  // Konfigurasi fondasi FE-09/12 boleh belum memiliki konteks ini; route FE-17 selalu mengisinya.
  else if (waktuKejadianAsal !== undefined) {
    const asal = Date.parse(waktuKejadianAsal);
    if (!Number.isFinite(asal)) fields.waktu = "Waktu laporan asal tidak valid. Buka kembali form dari detail lokasi.";
    else if (Date.parse(waktu) < asal) fields.waktu = "Waktu pembersihan tidak boleh sebelum waktu kejadian laporan asal.";
  }
  return { valid: Object.keys(fields).length === 0, fields };
}

/** Nilai min datetime-local dalam WIB; detik dipertahankan agar batas tepat tidak bergeser. */
export function waktuMinimumCleanIt(waktuKejadianAsal: string): string {
  return new Date(Date.parse(waktuKejadianAsal) + 7 * 60 * 60 * 1000).toISOString().slice(0, -1);
}

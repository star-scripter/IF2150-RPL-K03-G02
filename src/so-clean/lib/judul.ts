/**
 * Aturan panjang judul laporan — K7.
 *
 * Judul wajib 1–80 karakter. Judul CleanIt dibuat otomatis dari nama lokasi
 * ("Pembersihan {nama lokasi}") dan masih bisa diedit. Karena nama lokasi
 * maks. 255 karakter, judul otomatis harus dipotong agar tidak melebihi 80
 * karakter.
 *
 * Fungsi di file ini murni dan dipakai bersama FE–BE; tidak boleh mengimpor
 * dari `server/` atau mengakses database.
 */

/** Batas maksimum judul laporan (K7). */
export const MAKS_JUDUL = 80;

/**
 * Memotong judul ke maksimum `maks` karakter. Jika terpotong, satu karakter
 * terakhir diganti elipsis ("…") sebagai penanda. Spasi di awal/akhir dibuang.
 *
 * Pemotongan memakai code point (bukan unit UTF-16), jadi pasangan surrogate
 * seperti emoji tidak terbelah.
 */
export function potongJudul(judul: string, maks: number = MAKS_JUDUL): string {
  if (maks <= 0) return "";

  const teks = judul.trim();
  const karakter = Array.from(teks);

  if (karakter.length <= maks) return teks;
  if (maks === 1) return "…";

  return `${karakter.slice(0, maks - 1).join("").trimEnd()}…`;
}

/**
 * Judul default form CleanIt: "Pembersihan {nama lokasi}", dipotong otomatis
 * ke 80 karakter (K7). Operator/pelapor tetap boleh mengeditnya.
 */
export function buatJudulCleanIt(namaLokasi: string): string {
  return potongJudul(`Pembersihan ${namaLokasi.trim()}`);
}

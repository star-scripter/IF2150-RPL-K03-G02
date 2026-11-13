/**
 * Logika halaman Profil (FE-24) yang bisa diuji tanpa DOM: teks notifikasi dan tampilan nama.
 * Kontrak hanya mengirim data notifikasi mentah (BE-23); FE yang menyusun teks pesannya.
 */
import type { JenisLaporan, Notifikasi } from "../types/api";

export const LABEL_JENIS_LAPORAN: Record<JenisLaporan, string> = {
  REPORTIT: "ReportIt",
  CLEANIT: "CleanIt",
};

export const LABEL_STATUS_NOTIFIKASI: Record<Notifikasi["status"], string> = {
  VALID: "Disetujui",
  TIDAK_VALID: "Ditolak",
};

/**
 * Kalimat utama notifikasi. ReportIt yang disetujui tidak memberi poin ke pelapor (N1);
 * poin hanya untuk CleanIt yang VALID, nilainya dari `lokasi.poin`.
 */
export function pesanNotifikasi(n: Notifikasi): string {
  if (n.jenis === "REPORTIT") {
    return n.status === "VALID"
      ? "Laporan Anda disetujui Operator. Lokasinya kini tampil di daftar Lokasi untuk dibersihkan."
      : "Laporan Anda ditolak Operator.";
  }
  if (n.status === "VALID") {
    return n.poinDiberikan
      ? `Bukti pembersihan Anda disetujui. Anda mendapat ${n.poinDiberikan.toLocaleString("id-ID")} poin.`
      : "Bukti pembersihan Anda disetujui.";
  }
  return "Bukti pembersihan Anda ditolak Operator.";
}

/** Alasan penolakan yang layak ditampilkan; ReportIt boleh ditolak tanpa alasan. */
export function alasanNotifikasi(n: Notifikasi): string | null {
  if (n.status !== "TIDAK_VALID") return null;
  const alasan = n.alasanPenolakan?.trim();
  return alasan ? alasan : null;
}

export function jumlahBelumDibaca(daftar: readonly Notifikasi[]): number {
  return daftar.filter((n) => !n.dibaca).length;
}

const FORMAT_WAKTU = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

/** Waktu verifikasi dalam WIB, mis. "28 Okt 2026, 10.24". */
export function formatWaktuNotifikasi(iso: string): string {
  return FORMAT_WAKTU.format(new Date(iso));
}

/** Huruf pertama nama untuk avatar; "?" jika nama kosong. */
export function inisialNama(nama: string): string {
  return nama.trim().charAt(0).toUpperCase() || "?";
}

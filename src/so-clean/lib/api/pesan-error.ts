/**
 * Pesan error untuk pengguna (FE-04).
 *
 * Setiap kode di tabel "Kode error" kontrak dipetakan ke pesan berbahasa Indonesia.
 * `satisfies Record<KodeError, string>` membuat TypeScript menolak build jika ada kode
 * kontrak yang belum punya pesan.
 */
import type { KodeError } from "../../types/api";

/** Kode tambahan sisi klien: request tidak sampai ke server (offline, server mati, CORS). */
export type KodeErrorKlien = KodeError | "JARINGAN";

export const PESAN_ERROR = {
  DATA_TIDAK_LENGKAP: "Data belum lengkap. Lengkapi semua isian yang wajib.",
  FORMAT_TIDAK_VALID: "Format data tidak valid. Periksa kembali isian Anda.",
  UNAUTHORIZED: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  LOGIN_GAGAL: "Email atau password salah.",
  FORBIDDEN: "Anda tidak memiliki akses ke halaman ini.",
  NOT_FOUND: "Data tidak ditemukan.",
  EMAIL_TERDAFTAR: "Email sudah terdaftar. Gunakan email lain atau masuk.",
  SUDAH_DIVERIFIKASI: "Laporan ini sudah diverifikasi oleh Operator lain.",
  LOKASI_SUDAH_DIBERSIHKAN: "Lokasi ini sudah dibersihkan.",
  CLEANIT_SUDAH_MENUNGGU:
    "Anda masih punya laporan CleanIt untuk lokasi ini yang sedang menunggu verifikasi.",
  MEDIA_SUDAH_DIGUNAKAN: "Foto atau video ini sudah pernah dipakai di laporan lain.",
  FILE_TERLALU_BESAR: "Ukuran file melebihi 20 MB.",
  TIPE_FILE_TIDAK_DIDUKUNG: "Tipe file tidak didukung. Gunakan JPG, PNG, atau MP4.",
  POIN_TIDAK_CUKUP: "Poin Anda tidak cukup untuk menukar hadiah ini.",
  STOK_HABIS: "Stok hadiah ini sudah habis.",
  DI_LUAR_WILAYAH: "Lokasi berada di luar wilayah kerja sama SoClean.",
  INTERNAL_ERROR: "Terjadi kesalahan pada server. Coba lagi beberapa saat lagi.",
  JARINGAN: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
} as const satisfies Record<KodeErrorKlien, string>;

const KODE_KONTRAK = new Set<string>(Object.keys(PESAN_ERROR));

/** true jika `code` adalah kode error yang dikenal kontrak. */
export function isKodeError(code: unknown): code is KodeError {
  return typeof code === "string" && code !== "JARINGAN" && KODE_KONTRAK.has(code);
}

/** Pesan Indonesia untuk sebuah kode error. */
export function pesanError(code: KodeErrorKlien): string {
  return PESAN_ERROR[code];
}

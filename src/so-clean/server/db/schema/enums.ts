/**
 * Enum database (nilai sama dengan kontrak, huruf besar) dan helper kolom bersama.
 */
import { pgEnum, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["MASYARAKAT", "OPERATOR"]);
export const tipeMediaEnum = pgEnum("tipe_media", ["FOTO", "VIDEO"]);
export const jenisLaporanEnum = pgEnum("jenis_laporan", ["REPORTIT", "CLEANIT"]);
export const statusLaporanEnum = pgEnum("status_laporan", [
  "BELUM_DIPERIKSA",
  "VALID",
  "TIDAK_VALID",
]);
export const statusLokasiEnum = pgEnum("status_lokasi", ["TERCEMAR", "DIBERSIHKAN"]);

// K8
export const sumberEnum = pgEnum("sumber", [
  "PENGAMATAN_PRIBADI",
  "INFO_WARGA",
  "MEDIA_SOSIAL",
  "LAINNYA",
]);
export const jenisSampahEnum = pgEnum("jenis_sampah", [
  "PLASTIK",
  "KEMASAN_STYROFOAM",
  "RUMAH_TANGGA",
  "ORGANIK",
  "LAINNYA",
]);

/** Semua kolom waktu memakai timestamptz. */
export const waktu = (nama: string) => timestamp(nama, { withTimezone: true });

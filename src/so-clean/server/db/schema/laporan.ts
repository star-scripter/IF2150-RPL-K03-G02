/** Tabel laporan — C02 Laporan (ReportIt dan CleanIt). */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  jenisLaporanEnum,
  jenisSampahEnum,
  statusLaporanEnum,
  sumberEnum,
  waktu,
} from "./enums";
import { lokasi } from "./lokasi";
import { pengguna } from "./pengguna";

export const laporan = pgTable(
  "laporan",
  {
    id: serial("id").primaryKey(),
    jenis: jenisLaporanEnum("jenis").notNull(),
    idPengguna: uuid("id_pengguna")
      .notNull()
      .references(() => pengguna.id),
    judul: varchar("judul", { length: 80 }).notNull(), // K7
    waktuKejadian: waktu("waktu_kejadian").notNull(),
    // Khusus ReportIt
    lokasiTeks: varchar("lokasi_teks", { length: 255 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    sumber: sumberEnum("sumber"),
    jenisSampah: jenisSampahEnum("jenis_sampah"),
    // CleanIt: wajib (K1). ReportIt: diisi saat disetujui (K13).
    lokasiId: integer("lokasi_id").references((): AnyPgColumn => lokasi.id),
    status: statusLaporanEnum("status").notNull().default("BELUM_DIPERIKSA"),
    alasanPenolakan: text("alasan_penolakan"),
    diverifikasiOleh: uuid("diverifikasi_oleh").references(() => pengguna.id),
    diverifikasiAt: waktu("diverifikasi_at"),
    createdAt: waktu("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("laporan_antrean_idx").on(t.jenis, t.status, t.createdAt), // I-07
    index("laporan_notifikasi_idx").on(t.idPengguna, t.diverifikasiAt), // notifikasi
    index("laporan_lokasi_id_idx").on(t.lokasiId), // K12
    // v0.6: satu CleanIt yang menunggu per pengguna per lokasi (aman dari request bersamaan)
    uniqueIndex("laporan_cleanit_menunggu_uidx")
      .on(t.idPengguna, t.lokasiId)
      .where(sql`${t.jenis} = 'CLEANIT' AND ${t.status} = 'BELUM_DIPERIKSA'`),
    check(
      "laporan_field_per_jenis_check",
      sql`(${t.jenis} = 'REPORTIT'
            AND ${t.lokasiTeks} IS NOT NULL AND ${t.latitude} IS NOT NULL AND ${t.longitude} IS NOT NULL
            AND ${t.sumber} IS NOT NULL AND ${t.jenisSampah} IS NOT NULL)
          OR (${t.jenis} = 'CLEANIT'
            AND ${t.lokasiId} IS NOT NULL
            AND ${t.lokasiTeks} IS NULL AND ${t.latitude} IS NULL AND ${t.longitude} IS NULL
            AND ${t.sumber} IS NULL AND ${t.jenisSampah} IS NULL)`,
    ),
    check(
      "laporan_verifikasi_check",
      sql`(${t.status} = 'BELUM_DIPERIKSA') = (${t.diverifikasiAt} IS NULL)
          AND (${t.status} = 'BELUM_DIPERIKSA') = (${t.diverifikasiOleh} IS NULL)`,
    ),
    check(
      "laporan_alasan_cleanit_check",
      sql`NOT (${t.jenis} = 'CLEANIT' AND ${t.status} = 'TIDAK_VALID' AND ${t.alasanPenolakan} IS NULL)`,
    ),
    check(
      "laporan_koordinat_check",
      sql`${t.latitude} BETWEEN -90 AND 90 AND ${t.longitude} BETWEEN -180 AND 180`,
    ),
  ],
);

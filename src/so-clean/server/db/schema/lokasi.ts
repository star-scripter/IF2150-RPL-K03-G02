/** Tabel lokasi — C06 Lokasi. Dibuat saat ReportIt disetujui. */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { jenisSampahEnum, statusLokasiEnum, waktu } from "./enums";
import { laporan } from "./laporan";

export const lokasi = pgTable(
  "lokasi",
  {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(), // K9: sama dengan laporan.lokasi_teks
    alamat: varchar("alamat", { length: 255 }).notNull(), // K9
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    jenisSampah: jenisSampahEnum("jenis_sampah").notNull(), // K8
    status: statusLokasiEnum("status").notNull().default("TERCEMAR"), // K2
    poin: integer("poin").notNull().default(50), // K3: pilihan Operator 50/100/200
    laporanAsalId: integer("laporan_asal_id")
      .notNull()
      .references((): AnyPgColumn => laporan.id),
    createdAt: waktu("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("lokasi_status_idx").on(t.status),
    // BE-26: prefilter kotak lat/lng untuk pencarian lokasi TERCEMAR dalam radius 50 m (K13).
    index("lokasi_tercemar_koordinat_idx")
      .on(t.latitude, t.longitude)
      .where(sql`${t.status} = 'TERCEMAR'`),
    check("lokasi_poin_check", sql`${t.poin} IN (50, 100, 200)`),
    check(
      "lokasi_koordinat_check",
      sql`${t.latitude} BETWEEN -90 AND 90 AND ${t.longitude} BETWEEN -180 AND 180`,
    ),
  ],
);

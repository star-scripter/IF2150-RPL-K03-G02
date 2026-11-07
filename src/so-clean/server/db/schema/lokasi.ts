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
    nama: varchar("nama", { length: 100 }).notNull(), // K9
    alamat: varchar("alamat", { length: 255 }).notNull(), // K9
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    jenisSampah: jenisSampahEnum("jenis_sampah").notNull(), // K8
    status: statusLokasiEnum("status").notNull().default("TERCEMAR"), // K2
    poin: integer("poin").notNull(), // K3
    laporanAsalId: integer("laporan_asal_id")
      .notNull()
      .references((): AnyPgColumn => laporan.id),
    createdAt: waktu("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("lokasi_status_idx").on(t.status),
    check("lokasi_poin_check", sql`${t.poin} > 0`),
    check(
      "lokasi_koordinat_check",
      sql`${t.latitude} BETWEEN -90 AND 90 AND ${t.longitude} BETWEEN -180 AND 180`,
    ),
  ],
);

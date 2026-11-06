/**
 * Skema database (Drizzle). Sumber: bagian "Skema database" di docs/contracts.
 * Nama kolom di database snake_case; nama properti TypeScript camelCase.
 *
 * TODO(BE-02): lengkapi tabel lain (pengguna, media, wilayah, lokasi, laporan, laporan_media,
 * penukaran, notifikasi) setelah K1–K13 disepakati, lalu buat migrasi dengan drizzle-kit.
 */
import { sql } from "drizzle-orm";
import { check, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const reward = pgTable(
  "reward",
  {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 100 }).notNull(),
    jenis: varchar("jenis", { length: 50 }).notNull(),
    deskripsi: text("deskripsi"),
    hargaPoin: integer("harga_poin").notNull(),
    stok: integer("stok").notNull().default(0),
  },
  (t) => [check("reward_stok_check", sql`${t.stok} >= 0`)],
);

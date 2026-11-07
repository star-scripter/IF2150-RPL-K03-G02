/** Tabel media — C03 Media. `laporanId` NULL sampai media ditautkan saat laporan dibuat (K4). */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  index,
  integer,
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tipeMediaEnum, waktu } from "./enums";
import { laporan } from "./laporan";
import { pengguna } from "./pengguna";

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    idPengguna: uuid("id_pengguna")
      .notNull()
      .references(() => pengguna.id),
    laporanId: integer("laporan_id").references((): AnyPgColumn => laporan.id),
    // Key objek di MinIO/R2, bukan URL. URL dibuat saat dibaca (presigned).
    storageKey: varchar("storage_key", { length: 255 }).notNull().unique(),
    tipe: tipeMediaEnum("tipe").notNull(),
    ukuranByte: integer("ukuran_byte").notNull(),
    createdAt: waktu("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("media_laporan_id_idx").on(t.laporanId),
    check("media_ukuran_byte_check", sql`${t.ukuranByte} > 0`),
  ],
);

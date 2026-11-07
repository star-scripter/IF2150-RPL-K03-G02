/** Tabel pengguna — C08 Pengguna */
import { sql } from "drizzle-orm";
import { check, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { roleEnum, waktu } from "./enums";

export const pengguna = pgTable(
  "pengguna",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: varchar("nama", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: roleEnum("role").notNull().default("MASYARAKAT"),
    saldoPoin: integer("saldo_poin").notNull().default(0),
    // Notifikasi diturunkan dari laporan; yang lebih baru dari kolom ini = belum dibaca.
    notifikasiDilihatAt: waktu("notifikasi_dilihat_at"),
  },
  (t) => [check("pengguna_saldo_poin_check", sql`${t.saldoPoin} >= 0`)],
);

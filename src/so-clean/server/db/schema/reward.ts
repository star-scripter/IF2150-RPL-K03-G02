/** Tabel reward — C09 Reward */
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
  (t) => [
    check("reward_harga_poin_check", sql`${t.hargaPoin} > 0`),
    check("reward_stok_check", sql`${t.stok} >= 0`),
  ],
);

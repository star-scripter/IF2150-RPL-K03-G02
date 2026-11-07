/** Tabel penukaran — C13 Penukaran (Model) */
import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { waktu } from "./enums";
import { pengguna } from "./pengguna";
import { reward } from "./reward";

export const penukaran = pgTable(
  "penukaran",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    idPengguna: uuid("id_pengguna")
      .notNull()
      .references(() => pengguna.id),
    idReward: integer("id_reward")
      .notNull()
      .references(() => reward.id),
    poinDipakai: integer("poin_dipakai").notNull(),
    kodeVoucher: varchar("kode_voucher", { length: 32 }).notNull().unique(), // K5
    waktu: waktu("waktu").notNull().defaultNow(),
  },
  (t) => [
    index("penukaran_riwayat_idx").on(t.idPengguna, t.waktu),
    check("penukaran_poin_dipakai_check", sql`${t.poinDipakai} > 0`),
  ],
);

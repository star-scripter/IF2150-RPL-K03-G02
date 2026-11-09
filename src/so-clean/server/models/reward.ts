/**
 * Model Reward — katalog reward dummy (UC08) dan data reward untuk penukaran (UC09).
 *
 * Kelas DPPL: C09 - Reward
 */
import { asc, desc, eq, sql } from "drizzle-orm";
import { db, type Db } from "@/server/db";
import { reward } from "@/server/db/schema";
import type { Reward } from "@/types/api";

/** `db` atau `tx` dari `db.transaction(...)`. */
type Eksekutor = Pick<Db, "select" | "update">;

// Pemetaan kolom → field kontrak (`id` → `idReward`), dipakai ulang di semua query.
const kolomReward = {
  idReward: reward.id,
  nama: reward.nama,
  jenis: reward.jenis,
  hargaPoin: reward.hargaPoin,
  stok: reward.stok,
};

/**
 * getRewardTersedia() — Q-001 yang diubah oleh N3: mengembalikan **semua** reward (stok 0 tetap
 * ikut, ditampilkan FE sebagai "Habis"), urut stok > 0 dulu lalu harga poin naik.
 */
export async function getRewardTersedia(): Promise<Reward[]> {
  return db
    .select(kolomReward)
    .from(reward)
    .orderBy(desc(sql`${reward.stok} > 0`), asc(reward.hargaPoin), asc(reward.id));
}

/** cariReward(idReward) — Q-002. `null` jika reward tidak ditemukan. */
export async function cariReward(idReward: number, tx: Eksekutor = db): Promise<Reward | null> {
  const [row] = await tx.select(kolomReward).from(reward).where(eq(reward.id, idReward)).limit(1);
  return row ?? null;
}

/** tersedia() — Algo-004: true jika stok reward masih lebih dari nol. */
export function tersedia(data: Pick<Reward, "stok">): boolean {
  return data.stok > 0;
}

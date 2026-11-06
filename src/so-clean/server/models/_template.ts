/**
 * TEMPLATE MODEL — contoh memakai Reward (C09).
 *
 * Cara pakai:
 * 1. Salin file ini dan beri nama sesuai kelas DPPL dalam kebab-case,
 *    mis. `laporan.ts` (C02), `lokasi.ts` (C06), `pengguna.ts` (C08), `reward.ts` (C09).
 * 2. Ganti tabel, tipe, dan fungsi sesuai rincian kelas DPPL bab 5. Nama fungsi sebaiknya
 *    sama dengan nama method di DPPL supaya tabel traceability B.5 mudah diisi.
 * 3. Jika tabelnya belum ada, tambahkan dulu di `server/db/schema.ts`.
 *
 * Tanggung jawab model:
 * - Membaca/menulis data satu entitas lewat `db` (Drizzle) dan aturan yang melekat pada entitas itu.
 * - Mengubah baris database menjadi bentuk objek di kontrak API (mis. `id` → `idReward`).
 * - TIDAK tahu soal HTTP: tidak membaca Request, tidak membuat Response, tidak memakai status code.
 *   Kalau data tidak ada, kembalikan `null`; controller yang memutuskan 404.
 *
 * Kelas DPPL: C09 - Reward
 */
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { reward } from "@/server/db/schema";

// Bentuk objek sesuai kontrak API (docs/contracts, "Bentuk objek utama").
// TODO(FE-04/BE-04): pindahkan tipe ini ke `types/api.ts` agar dipakai bersama FE.
export type Reward = {
  idReward: number;
  nama: string;
  jenis: string;
  hargaPoin: number;
  stok: number;
};

// Kolom yang dipilih + pemetaan nama kolom → nama field kontrak. Dipakai ulang di semua query.
const kolomReward = {
  idReward: reward.id,
  nama: reward.nama,
  jenis: reward.jenis,
  hargaPoin: reward.hargaPoin,
  stok: reward.stok,
};

/** getRewardTersedia(): reward dengan stok > 0, urut harga naik. */
export async function getRewardTersedia(): Promise<Reward[]> {
  return db
    .select(kolomReward)
    .from(reward)
    .where(gt(reward.stok, 0))
    .orderBy(asc(reward.hargaPoin));
}

/** cariReward(idReward): satu reward, atau null jika tidak ditemukan. */
export async function cariReward(idReward: number): Promise<Reward | null> {
  const [hasil] = await db
    .select(kolomReward)
    .from(reward)
    .where(eq(reward.id, idReward))
    .limit(1);
  return hasil ?? null;
}

/**
 * kurangiStok(idReward): contoh operasi tulis yang aman dari race condition.
 * Kondisi `stok > 0` dicek di query UPDATE yang sama, jadi dua transaksi bersamaan
 * tidak bisa membuat stok negatif. Mengembalikan false jika stok sudah habis.
 *
 * Untuk operasi yang menyentuh beberapa tabel (mis. penukaran: kurangi stok + kurangi poin
 * + insert penukaran), controller membungkusnya dengan `db.transaction(async (tx) => ...)`
 * dan meneruskan `tx` ke fungsi model sebagai parameter opsional seperti di bawah.
 */
export async function kurangiStok(
  idReward: number,
  tx: Pick<typeof db, "update"> = db,
): Promise<boolean> {
  const diubah = await tx
    .update(reward)
    .set({ stok: sql`${reward.stok} - 1` })
    .where(and(eq(reward.id, idReward), gt(reward.stok, 0)))
    .returning({ id: reward.id });
  return diubah.length > 0;
}

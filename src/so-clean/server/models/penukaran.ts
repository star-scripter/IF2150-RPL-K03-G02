/**
 * Model Penukaran — catatan transaksi penukaran poin dengan reward (UC09) dan riwayatnya.
 *
 * Kelas DPPL: C13 - Penukaran (Model)
 */
import { randomInt } from "node:crypto";
import { count, desc, eq } from "drizzle-orm";
import { db, type Db } from "@/server/db";
import { penukaran, reward as tabelReward } from "@/server/db/schema";
import type { Penukaran, Reward } from "@/types/api";

/** `db` atau `tx` dari `db.transaction(...)`. */
type Eksekutor = Pick<Db, "insert">;

/** Huruf besar dan angka tanpa karakter yang mirip: tanpa 0, O, 1, I (K5). */
export const KARAKTER_VOUCHER = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Batas percobaan membuat kode baru jika bentrok dengan kode yang sudah ada. */
export const MAKS_PERCOBAAN_VOUCHER = 5;

/** Kode voucher dummy `SC-XXXX-XXXX` (K5), acak dengan `crypto.randomInt`. */
export function buatKodeVoucher(): string {
  const blok = () =>
    Array.from({ length: 4 }, () => KARAKTER_VOUCHER[randomInt(KARAKTER_VOUCHER.length)]).join("");
  return `SC-${blok()}-${blok()}`;
}

/**
 * buatPenukaran(pengguna, reward) — Algo-001. Menyimpan catatan penukaran dengan
 * `poin_dipakai` = harga reward dan kode voucher unik, lalu mengembalikan datanya (bukan hanya
 * Boolean seperti di DPPL) untuk respons `POST /api/penukaran`.
 *
 * Bentrok kode voucher ditangani dengan `ON CONFLICT DO NOTHING` lalu membuat kode baru, bukan
 * dengan menangkap error UNIQUE, karena error di dalam transaksi PostgreSQL membatalkan seluruh
 * transaksi penukaran. Dipanggil di dalam transaksi yang dibuka controller Penukaran.
 */
export async function buatPenukaran(
  idPengguna: string,
  reward: Pick<Reward, "idReward" | "nama" | "hargaPoin">,
  tx: Eksekutor = db,
  buatKode: () => string = buatKodeVoucher,
): Promise<Penukaran> {
  for (let percobaan = 0; percobaan < MAKS_PERCOBAAN_VOUCHER; percobaan++) {
    const [row] = await tx
      .insert(penukaran)
      .values({
        idPengguna,
        idReward: reward.idReward,
        poinDipakai: reward.hargaPoin,
        kodeVoucher: buatKode(),
      })
      .onConflictDoNothing({ target: penukaran.kodeVoucher })
      .returning({
        idPenukaran: penukaran.id,
        kodeVoucher: penukaran.kodeVoucher,
        poinDipakai: penukaran.poinDipakai,
        waktu: penukaran.waktu,
      });

    if (row) {
      return {
        idPenukaran: row.idPenukaran,
        namaReward: reward.nama,
        kodeVoucher: row.kodeVoucher,
        poinDipakai: row.poinDipakai,
        waktuPenukaran: row.waktu.toISOString(),
      };
    }
  }
  throw new Error(`Gagal membuat kode voucher unik setelah ${MAKS_PERCOBAAN_VOUCHER} percobaan.`);
}

/**
 * Riwayat penukaran milik satu pengguna (N13), urut waktu terbaru, dengan pagination.
 * Memakai index `penukaran (id_pengguna, waktu)`.
 */
export async function getRiwayat(
  idPengguna: string,
  page: number,
  limit: number,
): Promise<{ data: Penukaran[]; total: number }> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(penukaran)
    .where(eq(penukaran.idPengguna, idPengguna));

  const rows = await db
    .select({
      idPenukaran: penukaran.id,
      namaReward: tabelReward.nama,
      kodeVoucher: penukaran.kodeVoucher,
      poinDipakai: penukaran.poinDipakai,
      waktu: penukaran.waktu,
    })
    .from(penukaran)
    .innerJoin(tabelReward, eq(tabelReward.id, penukaran.idReward))
    .where(eq(penukaran.idPengguna, idPengguna))
    .orderBy(desc(penukaran.waktu), desc(penukaran.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    data: rows.map(({ waktu, ...row }) => ({ ...row, waktuPenukaran: waktu.toISOString() })),
    total,
  };
}

/**
 * Model Pengguna — operasi auth (BE-05) dan saldo poin (C08 Q-001–Q-003).
 *
 * Data profil dan saldo selalu dibaca/ditulis langsung di database, bukan dari cookie sesi.
 * Operasi saldo menerima `tx` agar bisa dijalankan di dalam transaksi yang dibuka controller
 * (penukaran BE-21, setujui CleanIt BE-14).
 *
 * Kelas DPPL: C08 - Pengguna
 */
import { and, eq, gte, sql } from "drizzle-orm";
import type { Pengguna, PenggunaMe } from "@/types/api";
import { normalisasiEmail, normalisasiNama } from "@/server/auth/account";
import { db, type Db } from "@/server/db";
import { pengguna } from "@/server/db/schema";

export type PenggunaUntukLogin = Pengguna & {
  passwordHash: string;
};

/** Ambil data autentikasi lewat email yang telah dinormalisasi; null jika tidak ada. */
export async function cariUntukLogin(email: string): Promise<PenggunaUntukLogin | null> {
  const [row] = await db
    .select({
      id: pengguna.id,
      nama: pengguna.nama,
      email: pengguna.email,
      role: pengguna.role,
      passwordHash: pengguna.passwordHash,
    })
    .from(pengguna)
    .where(eq(pengguna.email, normalisasiEmail(email)))
    .limit(1);

  return row ?? null;
}

/** Buat akun register dengan role tetap MASYARAKAT; null menandakan email sudah dipakai. */
export async function buatMasyarakat(input: {
  nama: string;
  email: string;
  passwordHash: string;
}): Promise<Pengguna | null> {
  const [row] = await db
    .insert(pengguna)
    .values({
      nama: normalisasiNama(input.nama),
      email: normalisasiEmail(input.email),
      passwordHash: input.passwordHash,
      role: "MASYARAKAT",
    })
    .onConflictDoNothing({ target: pengguna.email })
    .returning({
      id: pengguna.id,
      nama: pengguna.nama,
      email: pengguna.email,
      role: pengguna.role,
    });

  return row ?? null;
}

/** Ambil data profil terkini dari database, bukan dari claim JWT. */
export async function getMe(idPengguna: string): Promise<PenggunaMe | null> {
  const [row] = await db
    .select({
      id: pengguna.id,
      nama: pengguna.nama,
      email: pengguna.email,
      role: pengguna.role,
      saldoPoin: pengguna.saldoPoin,
    })
    .from(pengguna)
    .where(eq(pengguna.id, idPengguna))
    .limit(1);

  return row ?? null;
}

/** `db` atau `tx` dari `db.transaction(...)`. */
type Eksekutor = Pick<Db, "select" | "update">;

function wajibJumlahPositif(jumlah: number): void {
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    throw new RangeError(`Jumlah poin harus bilangan bulat positif, diterima ${jumlah}.`);
  }
}

/** getSaldoPoin() — Q-001. `null` jika pengguna tidak ditemukan. */
export async function getSaldoPoin(
  idPengguna: string,
  tx: Eksekutor = db,
): Promise<number | null> {
  const [row] = await tx
    .select({ saldoPoin: pengguna.saldoPoin })
    .from(pengguna)
    .where(eq(pengguna.id, idPengguna))
    .limit(1);
  return row?.saldoPoin ?? null;
}

/** cukupPoin(harga) — Algo-002: true jika saldo ≥ harga. Pengguna tidak ada dianggap tidak cukup. */
export async function cukupPoin(
  idPengguna: string,
  harga: number,
  tx: Eksekutor = db,
): Promise<boolean> {
  const saldo = await getSaldoPoin(idPengguna, tx);
  return saldo !== null && saldo >= harga;
}

/**
 * kurangiPoin(jumlah) — Q-002. UPDATE bersyarat `saldo_poin >= jumlah`, jadi dua penukaran
 * bersamaan tidak bisa membuat saldo negatif. Mengembalikan saldo baru, atau `null` jika saldo
 * tidak cukup (tidak ada baris yang berubah). Dipanggil di dalam transaksi penukaran.
 */
export async function kurangiPoin(
  idPengguna: string,
  jumlah: number,
  tx: Eksekutor = db,
): Promise<number | null> {
  wajibJumlahPositif(jumlah);
  const [row] = await tx
    .update(pengguna)
    .set({ saldoPoin: sql`${pengguna.saldoPoin} - ${jumlah}` })
    .where(and(eq(pengguna.id, idPengguna), gte(pengguna.saldoPoin, jumlah)))
    .returning({ saldoPoin: pengguna.saldoPoin });
  return row?.saldoPoin ?? null;
}

/**
 * tambah_poin(jumlahPoin) — Q-003. Menambah saldo setelah CleanIt pengguna dinyatakan valid dan
 * mengembalikan saldo baru. Sesuai Algo-004, jumlah ≤ 0 tidak mengubah saldo. `null` jika
 * pengguna tidak ditemukan.
 */
export async function tambah_poin(
  idPengguna: string,
  jumlahPoin: number,
  tx: Eksekutor = db,
): Promise<number | null> {
  if (jumlahPoin <= 0) return getSaldoPoin(idPengguna, tx);
  wajibJumlahPositif(jumlahPoin);

  const [row] = await tx
    .update(pengguna)
    .set({ saldoPoin: sql`${pengguna.saldoPoin} + ${jumlahPoin}` })
    .where(eq(pengguna.id, idPengguna))
    .returning({ saldoPoin: pengguna.saldoPoin });
  return row?.saldoPoin ?? null;
}

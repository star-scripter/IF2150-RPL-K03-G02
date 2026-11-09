/** Operasi model Pengguna/C08 yang dibutuhkan oleh auth dan GET /api/me. */
import { eq } from "drizzle-orm";
import type { Pengguna, PenggunaMe } from "@/types/api";
import { normalisasiEmail, normalisasiNama } from "@/server/auth/account";
import { db } from "@/server/db";
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

/**
 * Helper test integrasi: mengosongkan database test dan membuat data uji.
 *
 * Hanya dipakai di test. Data dibuat langsung lewat Drizzle (bukan lewat model) supaya test
 * model/endpoint tidak bergantung pada kode yang sedang diuji.
 */
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { laporan, lokasi, media, pengguna, reward } from "@/server/db/schema";
import type { JenisSampah, PilihanPoin, Role, StatusLokasi, Sumber, TipeMedia } from "@/types/api";
import { DATABASE_TEST_AKTIF } from "./database-test";

export { DATABASE_TEST_AKTIF };

/** Mengosongkan semua tabel aplikasi. Ditolak jika bukan database `*_test`. */
export async function kosongkanDatabase(): Promise<void> {
  if (!DATABASE_TEST_AKTIF) {
    throw new Error("kosongkanDatabase() hanya boleh dipakai pada database *_test.");
  }
  await db.execute(
    sql`TRUNCATE penukaran, reward, media, laporan, lokasi, pengguna RESTART IDENTITY CASCADE`,
  );
}

export async function buatPengguna(
  opsi: {
    role?: Role;
    nama?: string;
    saldoPoin?: number;
    notifikasiDilihatAt?: Date | null;
  } = {},
): Promise<{ id: string; role: Role }> {
  const [row] = await db
    .insert(pengguna)
    .values({
      nama: opsi.nama ?? "Pengguna Uji",
      email: `uji-${randomUUID()}@soclean.test`,
      passwordHash: "hash-tidak-dipakai",
      role: opsi.role ?? "MASYARAKAT",
      saldoPoin: opsi.saldoPoin ?? 0,
      notifikasiDilihatAt: opsi.notifikasiDilihatAt ?? null,
    })
    .returning({ id: pengguna.id, role: pengguna.role });
  return row;
}

/**
 * Membuat lokasi beserta ReportIt asalnya yang sudah VALID (seperti hasil BE-13):
 * laporan asal → lokasi → `laporan.lokasi_id` diisi.
 */
export async function buatLokasi(opsi: {
  pelapor: string;
  operator: string;
  nama?: string;
  alamat?: string;
  latitude?: number;
  longitude?: number;
  jenisSampah?: JenisSampah;
  sumber?: Sumber;
  status?: StatusLokasi;
  poin?: PilihanPoin;
  judul?: string;
  waktuKejadian?: Date;
  /** created_at laporan asal (= `dilaporkanAt` lokasi). */
  dilaporkanAt?: Date;
}): Promise<{ idLokasi: number; idLaporanAsal: number }> {
  return db.transaction(async (tx) => {
    const dilaporkanAt = opsi.dilaporkanAt ?? new Date();
    const [asal] = await tx
      .insert(laporan)
      .values({
        jenis: "REPORTIT",
        idPengguna: opsi.pelapor,
        judul: opsi.judul ?? "Sampah plastik di tepi sungai",
        waktuKejadian: opsi.waktuKejadian ?? new Date(dilaporkanAt.getTime() - 60 * 60 * 1000),
        lokasiTeks: opsi.alamat ?? "Jl. Uji No. 1",
        latitude: opsi.latitude ?? -6.885,
        longitude: opsi.longitude ?? 107.6065,
        sumber: opsi.sumber ?? "PENGAMATAN_PRIBADI",
        jenisSampah: opsi.jenisSampah ?? "PLASTIK",
        status: "VALID",
        diverifikasiOleh: opsi.operator,
        diverifikasiAt: dilaporkanAt,
        createdAt: dilaporkanAt,
      })
      .returning({ id: laporan.id });

    const [baru] = await tx
      .insert(lokasi)
      .values({
        nama: opsi.nama ?? "Lokasi Uji",
        alamat: opsi.alamat ?? "Jl. Uji No. 1",
        latitude: opsi.latitude ?? -6.885,
        longitude: opsi.longitude ?? 107.6065,
        jenisSampah: opsi.jenisSampah ?? "PLASTIK",
        status: opsi.status ?? "TERCEMAR",
        poin: opsi.poin ?? 50,
        laporanAsalId: asal.id,
      })
      .returning({ id: lokasi.id });

    await tx.update(laporan).set({ lokasiId: baru.id }).where(eq(laporan.id, asal.id));
    return { idLokasi: baru.id, idLaporanAsal: asal.id };
  });
}

export async function buatMedia(opsi: {
  idPengguna: string;
  laporanId: number | null;
  tipe?: TipeMedia;
  storageKey?: string;
  createdAt?: Date;
}): Promise<{ idMedia: number; storageKey: string }> {
  const storageKey = opsi.storageKey ?? `uji/${randomUUID()}.jpg`;
  const [row] = await db
    .insert(media)
    .values({
      idPengguna: opsi.idPengguna,
      laporanId: opsi.laporanId,
      storageKey,
      tipe: opsi.tipe ?? "FOTO",
      ukuranByte: 1024,
      sha256: randomUUID().replaceAll("-", "").padEnd(64, "0"),
      createdAt: opsi.createdAt ?? new Date(),
    })
    .returning({ id: media.id });
  return { idMedia: row.id, storageKey };
}

export async function buatReward(
  opsi: { nama?: string; jenis?: string; hargaPoin?: number; stok?: number } = {},
): Promise<{ idReward: number }> {
  const [row] = await db
    .insert(reward)
    .values({
      nama: opsi.nama ?? "Voucher Uji",
      jenis: opsi.jenis ?? "VOUCHER",
      deskripsi: "Reward dummy untuk test.",
      hargaPoin: opsi.hargaPoin ?? 50,
      stok: opsi.stok ?? 10,
    })
    .returning({ idReward: reward.id });
  return row;
}

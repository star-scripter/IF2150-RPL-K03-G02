/** Model Media — menyimpan metadata media dan mengecek penggunaan ulang hash (C03). */
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, type Db } from "@/server/db";
import { laporan, media } from "@/server/db/schema";
import type { TipeMedia } from "@/types/api";

type Eksekutor = Pick<Db, "select">;

export type MediaUntukLaporan = {
  idMedia: number;
  idPengguna: string;
  laporanId: number | null;
  sha256: string;
};

export type MediaBaru = {
  idPengguna: string;
  storageKey: string;
  tipe: TipeMedia;
  ukuranByte: number;
  sha256: string;
  createdAt: Date;
};

/** Hash dipakai hanya jika media sudah tertaut ke laporan yang tidak ditolak. */
export async function sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean> {
  const [baris] = await tx
    .select({ id: media.id })
    .from(media)
    .innerJoin(laporan, eq(media.laporanId, laporan.id))
    .where(and(eq(media.sha256, sha256), ne(laporan.status, "TIDAK_VALID")))
    .limit(1);

  return baris !== undefined;
}

/** Ambil hanya media yang dimiliki pengguna; item hilang/asing terdeteksi dari jumlah baris. */
export async function getUntukLaporan(
  idMedia: number[],
  idPengguna: string,
  tx: Eksekutor = db,
): Promise<MediaUntukLaporan[]> {
  if (idMedia.length === 0) return [];

  return tx
    .select({
      idMedia: media.id,
      idPengguna: media.idPengguna,
      laporanId: media.laporanId,
      sha256: media.sha256,
    })
    .from(media)
    .where(and(inArray(media.id, idMedia), eq(media.idPengguna, idPengguna)));
}

/** Simpan metadata setelah object berhasil diunggah; laporanId sengaja tetap NULL. */
export async function buatMedia(input: MediaBaru): Promise<number> {
  const [baris] = await db
    .insert(media)
    .values({
      ...input,
      laporanId: null,
    })
    .returning({ id: media.id });

  return baris.id;
}

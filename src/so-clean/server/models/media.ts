/** Model Media — menyimpan metadata media dan mengecek penggunaan ulang hash (C03). */
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/server/db";
import { laporan, media } from "@/server/db/schema";
import type { TipeMedia } from "@/types/api";

export type MediaBaru = {
  idPengguna: string;
  storageKey: string;
  tipe: TipeMedia;
  ukuranByte: number;
  sha256: string;
  createdAt: Date;
};

/** Hash dipakai hanya jika media sudah tertaut ke laporan yang tidak ditolak. */
export async function sudahDipakai(sha256: string): Promise<boolean> {
  const [baris] = await db
    .select({ id: media.id })
    .from(media)
    .innerJoin(laporan, eq(media.laporanId, laporan.id))
    .where(and(eq(media.sha256, sha256), ne(laporan.status, "TIDAK_VALID")))
    .limit(1);

  return baris !== undefined;
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

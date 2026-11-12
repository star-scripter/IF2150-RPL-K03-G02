/** Model Media — menyimpan metadata media dan mengecek penggunaan ulang hash (C03). */
import { and, asc, eq, inArray, isNull, ne } from "drizzle-orm";
import { db, type Db } from "@/server/db";
import { laporan, media } from "@/server/db/schema";
import type { TipeMedia } from "@/types/api";

type Eksekutor = Pick<Db, "select">;

/** Media yang sudah tertaut ke laporan; `storageKey` diubah menjadi `url` oleh controller. */
export type MediaTersimpan = {
  idMedia: number;
  tipe: TipeMedia;
  storageKey: string;
  createdAt: string;
};

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

/** Tautkan hanya media milik pengguna yang masih belum terpakai; caller memeriksa jumlah baris. */
export async function tautkanKeLaporan(
  idMedia: number[],
  idPengguna: string,
  idLaporan: number,
  tx: Pick<Db, "update"> = db,
): Promise<number> {
  if (idMedia.length === 0) return 0;

  const rows = await tx
    .update(media)
    .set({ laporanId: idLaporan })
    .where(and(inArray(media.id, idMedia), eq(media.idPengguna, idPengguna), isNull(media.laporanId)))
    .returning({ idMedia: media.id });

  return rows.length;
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

/** Media milik satu laporan untuk ditampilkan (detail laporan/lokasi), urut ID unggah. */
export async function getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]> {
  const rows = await tx
    .select({
      idMedia: media.id,
      tipe: media.tipe,
      storageKey: media.storageKey,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(eq(media.laporanId, idLaporan))
    .orderBy(asc(media.id));
  return rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
}

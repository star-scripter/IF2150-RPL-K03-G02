/**
 * Model Lokasi — operasi baca lokasi pencemaran untuk CleanIt (UC04).
 *
 * `get_all_lokasi_valid` = C06 Q-003 dan `get_lokasi` = C06 Q-004, disesuaikan dengan kontrak:
 * lokasi bisa difilter per status, list kosong dikembalikan sebagai `[]` (bukan null), dan
 * `dilaporkanAt` diambil dari `created_at` laporan asal. Media dikembalikan dengan `storageKey`;
 * URL-nya dibuat controller lewat `getUrl` karena presigned URL punya masa berlaku.
 *
 * Kelas DPPL: C06 - Lokasi
 */
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { laporan, lokasi, media } from "@/server/db/schema";
import type { Lokasi, LokasiDetail, PilihanPoin, StatusLokasi, TipeMedia } from "@/types/api";

/** Media yang tersimpan; `storageKey` diubah menjadi `url` oleh controller. */
export type MediaTersimpan = {
  idMedia: number;
  tipe: TipeMedia;
  storageKey: string;
  createdAt: string;
};

/** `LokasiDetail` sebelum URL media dibuat. */
export type LokasiDenganAsal = Lokasi & {
  laporanAsal: Omit<LokasiDetail["laporanAsal"], "media"> & { media: MediaTersimpan[] };
};

const kolomLokasi = {
  idLokasi: lokasi.id,
  nama: lokasi.nama,
  alamat: lokasi.alamat,
  latitude: lokasi.latitude,
  longitude: lokasi.longitude,
  jenisSampah: lokasi.jenisSampah,
  status: lokasi.status,
  poin: lokasi.poin,
  dilaporkanAt: laporan.createdAt,
};

type BarisLokasi = {
  [K in keyof typeof kolomLokasi]: (typeof kolomLokasi)[K]["_"]["data"];
};

function keLokasi(row: BarisLokasi): Lokasi {
  return {
    ...row,
    // Dijaga CHECK lokasi_poin_check: hanya 50, 100, atau 200 (K3).
    poin: row.poin as PilihanPoin,
    dilaporkanAt: row.dilaporkanAt.toISOString(),
  };
}

/**
 * get_all_lokasi_valid(): semua lokasi dengan status tertentu (default TERCEMAR), tanpa filter
 * radius (N11). Urut laporan terbaru dulu, sama dengan urutan "Terbaru" di I-09.
 */
export async function get_all_lokasi_valid(
  status: StatusLokasi = "TERCEMAR",
): Promise<Lokasi[]> {
  const rows = await db
    .select(kolomLokasi)
    .from(lokasi)
    .innerJoin(laporan, eq(laporan.id, lokasi.laporanAsalId))
    .where(eq(lokasi.status, status))
    .orderBy(desc(laporan.createdAt), desc(lokasi.id));
  return rows.map(keLokasi);
}

/** get_lokasi(idLokasi): satu lokasi beserta laporan asal dan medianya, atau null. */
export async function get_lokasi(idLokasi: number): Promise<LokasiDenganAsal | null> {
  const [row] = await db
    .select({
      ...kolomLokasi,
      asalId: laporan.id,
      asalJudul: laporan.judul,
      asalWaktu: laporan.waktuKejadian,
      asalSumber: laporan.sumber,
    })
    .from(lokasi)
    .innerJoin(laporan, eq(laporan.id, lokasi.laporanAsalId))
    .where(eq(lokasi.id, idLokasi))
    .limit(1);
  if (!row) return null;

  const { asalId, asalJudul, asalWaktu, asalSumber, ...dataLokasi } = row;
  if (asalSumber === null) {
    // Laporan asal lokasi selalu ReportIt, yang wajib punya sumber (CHECK laporan_field_per_jenis_check).
    throw new Error(`Laporan asal lokasi ${idLokasi} tidak memiliki sumber.`);
  }

  const daftarMedia = await db
    .select({
      idMedia: media.id,
      tipe: media.tipe,
      storageKey: media.storageKey,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(eq(media.laporanId, asalId))
    .orderBy(asc(media.id));

  return {
    ...keLokasi(dataLokasi),
    laporanAsal: {
      idLaporan: asalId,
      judul: asalJudul,
      waktu: asalWaktu.toISOString(),
      sumber: asalSumber,
      media: daftarMedia.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    },
  };
}

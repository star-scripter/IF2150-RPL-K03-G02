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
import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db, type Db } from "@/server/db";
import { laporan, lokasi } from "@/server/db/schema";
import { getByLaporan, type MediaTersimpan } from "@/server/models/media";
import type { JenisSampah, Lokasi, LokasiDetail, PilihanPoin, StatusLokasi } from "@/types/api";

export type { MediaTersimpan };

/** Radius penggabungan lokasi (K13): lokasi dianggap sama jika berjarak ≤ 50 m. */
export const RADIUS_GABUNG_METER = 50;

/** `LokasiDetail` sebelum URL media dibuat. */
export type LokasiDenganAsal = Lokasi & {
  laporanAsal: Omit<LokasiDetail["laporanAsal"], "media"> & { media: MediaTersimpan[] };
};

/** Data minimum CleanIt validator; status lokasi dikunci selama transaksi pembuat laporan. */
export type LokasiUntukValidasiCleanIt = {
  idLokasi: number;
  status: StatusLokasi;
  waktuKejadianAsal: Date;
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

  const daftarMedia = await getByLaporan(asalId);

  return {
    ...keLokasi(dataLokasi),
    laporanAsal: {
      idLaporan: asalId,
      judul: asalJudul,
      waktu: asalWaktu.toISOString(),
      sumber: asalSumber,
      media: daftarMedia,
    },
  };
}

/**
 * Baca lokasi dan waktu kejadian laporan asal. `FOR SHARE` harus dijalankan lewat tx yang
 * nantinya juga menyimpan laporan (BE-11), agar persetujuan CleanIt tetap melihat status stabil.
 */
export async function getUntukValidasiCleanIt(
  idLokasi: number,
  tx: Pick<Db, "select"> = db,
): Promise<LokasiUntukValidasiCleanIt | null> {
  const [baris] = await tx
    .select({
      idLokasi: lokasi.id,
      status: lokasi.status,
      waktuKejadianAsal: laporan.waktuKejadian,
    })
    .from(lokasi)
    .innerJoin(laporan, eq(laporan.id, lokasi.laporanAsalId))
    .where(eq(lokasi.id, idLokasi))
    .for("share", { of: lokasi })
    .limit(1);

  return baris ?? null;
}

/** Ringkasan lokasi untuk mengisi field `Laporan` CleanIt (lokasi, koordinat, jenis sampah). */
export type RingkasanLokasi = {
  nama: string;
  latitude: number;
  longitude: number;
  jenisSampah: JenisSampah;
};

/** Jarak (meter) dari kolom koordinat lokasi ke titik (latitude, longitude), rumus haversine. */
function jarakMeterKe(latitude: number, longitude: number) {
  return sql<number>`(2 * 6371000 * asin(least(1, sqrt(
    power(sin(radians(${lokasi.latitude} - ${latitude}) / 2), 2)
    + cos(radians(${latitude})) * cos(radians(${lokasi.latitude}))
      * power(sin(radians(${lokasi.longitude} - ${longitude}) / 2), 2)))))`.mapWith(Number);
}

/**
 * Lokasi TERCEMAR terdekat dalam radius 50 m dari titik ReportIt (K13), atau null. Dipakai untuk
 * `lokasiTerdekat` di detail laporan dan sebagai tujuan penggabungan saat ReportIt disetujui.
 * Pengganti C06 Q-001 yang membandingkan koordinat persis.
 */
export async function cariTerdekatTercemar(
  latitude: number,
  longitude: number,
  tx: Pick<Db, "select"> = db,
  opsi: { kunci?: boolean } = {},
): Promise<{ idLokasi: number; nama: string; jarakMeter: number } | null> {
  const jarak = jarakMeterKe(latitude, longitude);
  const query = tx
    .select({ idLokasi: lokasi.id, nama: lokasi.nama, jarakMeter: jarak })
    .from(lokasi)
    .where(and(eq(lokasi.status, "TERCEMAR"), lte(jarak, RADIUS_GABUNG_METER)))
    .orderBy(asc(jarak), asc(lokasi.id))
    .limit(1)
    .$dynamic();
  // `kunci`: FOR SHARE agar persetujuan CleanIt yang mengubah lokasi ini ke DIBERSIHKAN menunggu
  // sampai penggabungan selesai (dan sebaliknya, baris yang sudah DIBERSIHKAN tidak terpilih).
  const [baris] = await (opsi.kunci ? query.for("share", { of: lokasi }) : query);
  return baris ?? null;
}

/** Ringkasan beberapa lokasi sekaligus, dalam Map dengan kunci `idLokasi`. */
export async function getRingkasanByIds(
  idLokasi: number[],
  tx: Pick<Db, "select"> = db,
): Promise<Map<number, RingkasanLokasi>> {
  if (idLokasi.length === 0) return new Map();
  const rows = await tx
    .select({
      idLokasi: lokasi.id,
      nama: lokasi.nama,
      latitude: lokasi.latitude,
      longitude: lokasi.longitude,
      jenisSampah: lokasi.jenisSampah,
    })
    .from(lokasi)
    .where(inArray(lokasi.id, idLokasi));
  return new Map(rows.map(({ idLokasi: id, ...ringkasan }) => [id, ringkasan]));
}

/** ID pelapor laporan asal lokasi (Aturan CleanIt nomor 6), atau null jika lokasi tidak ada. */
export async function getPelaporAsal(
  idLokasi: number,
  tx: Pick<Db, "select"> = db,
): Promise<string | null> {
  const [baris] = await tx
    .select({ idPengguna: laporan.idPengguna })
    .from(lokasi)
    .innerJoin(laporan, eq(laporan.id, lokasi.laporanAsalId))
    .where(eq(lokasi.id, idLokasi))
    .limit(1);
  return baris?.idPengguna ?? null;
}

/**
 * Kunci transaksi (advisory lock) untuk pemetaan lokasi ReportIt. Persetujuan ReportIt berjalan
 * satu per satu, sehingga dua ReportIt berdekatan yang disetujui bersamaan tidak sama-sama
 * membuat lokasi baru dalam radius 50 m (K13). Kunci lepas otomatis saat transaksi selesai.
 */
export async function kunciPemetaanLokasi(tx: Pick<Db, "execute">): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('soclean:petakan_lokasi'))`);
}

/** Data lokasi baru dari ReportIt yang disetujui (K3, K8, K9). */
export type LokasiBaru = {
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  jenisSampah: JenisSampah;
  poin: PilihanPoin;
  laporanAsalId: number;
};

/**
 * simpan_lokasi() — Q-002: menyimpan lokasi pencemaran baru berstatus TERCEMAR dan mengembalikan
 * `idLokasi`. Cek duplikat Q-001 diganti `cariTerdekatTercemar` (radius 50 m, K13).
 */
export async function simpan_lokasi(data: LokasiBaru, tx: Pick<Db, "insert"> = db): Promise<number> {
  const [baris] = await tx
    .insert(lokasi)
    .values({ ...data, status: "TERCEMAR" })
    .returning({ idLokasi: lokasi.id });
  return baris.idLokasi;
}

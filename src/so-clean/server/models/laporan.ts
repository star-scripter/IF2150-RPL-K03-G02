/** Model Laporan — operasi persistensi ReportIt/CleanIt (C02). */
import { and, asc, count, desc, eq, gte, ne, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, type Db } from "@/server/db";
import { laporan, lokasi } from "@/server/db/schema";
import type { JenisLaporan, JenisSampah, Sumber, StatusLaporan } from "@/types/api";

/** `db` atau `tx` dari `db.transaction(...)`. */
type Eksekutor = Pick<Db, "insert" | "select" | "update">;

type LaporanBaruDasar = {
  idPengguna: string;
  judul: string;
  waktu: Date;
};

/** Data untuk insert; validasi bisnis dan media terkait menjadi tanggung jawab BE-10/BE-11. */
export type LaporanBaru =
  | (LaporanBaruDasar & {
      jenis: "REPORTIT";
      lokasi: string;
      latitude: number;
      longitude: number;
      sumber: Sumber;
      jenisSampah: JenisSampah;
    })
  | (LaporanBaruDasar & {
      jenis: "CLEANIT";
      lokasiId: number;
    });

/** Status final harus menyertakan metadata verifikasi agar konsisten dengan CHECK database. */
export type PerubahanStatusLaporan =
  | { status: "BELUM_DIPERIKSA"; diverifikasiOleh?: null; diverifikasiAt?: null }
  | { status: Exclude<StatusLaporan, "BELUM_DIPERIKSA">; diverifikasiOleh: string; diverifikasiAt: Date };

export type FilterDaftarLaporan = {
  jenis?: JenisLaporan;
  status?: StatusLaporan;
  sort?: "terbaru" | "terlama";
  page: number;
  limit: number;
};

/** Kolom DB dipetakan ke nama model/kontrak, bukan nama properti database. */
const kolomLaporan = {
  idLaporan: laporan.id,
  jenis: laporan.jenis,
  idPengguna: laporan.idPengguna,
  judul: laporan.judul,
  waktu: laporan.waktuKejadian,
  lokasi: laporan.lokasiTeks,
  latitude: laporan.latitude,
  longitude: laporan.longitude,
  sumber: laporan.sumber,
  jenisSampah: laporan.jenisSampah,
  lokasiId: laporan.lokasiId,
  status: laporan.status,
  alasanPenolakan: laporan.alasanPenolakan,
  diverifikasiOleh: laporan.diverifikasiOleh,
  diverifikasiAt: laporan.diverifikasiAt,
  createdAt: laporan.createdAt,
};

export type LaporanTersimpan = {
  idLaporan: number;
  jenis: JenisLaporan;
  idPengguna: string;
  judul: string;
  waktu: Date;
  lokasi: string | null;
  latitude: number | null;
  longitude: number | null;
  sumber: Sumber | null;
  jenisSampah: JenisSampah | null;
  lokasiId: number | null;
  status: StatusLaporan;
  alasanPenolakan: string | null;
  diverifikasiOleh: string | null;
  diverifikasiAt: Date | null;
  createdAt: Date;
};

function kondisiFilter(filter: Pick<FilterDaftarLaporan, "jenis" | "status">): SQL | undefined {
  const kondisi: SQL[] = [];
  if (filter.jenis) kondisi.push(eq(laporan.jenis, filter.jenis));
  if (filter.status) kondisi.push(eq(laporan.status, filter.status));
  return and(...kondisi);
}

/** Buat record laporan; `createdAt` dan status awal mengikuti default database. */
export async function buatLaporan(
  input: LaporanBaru,
  tx: Eksekutor = db,
): Promise<LaporanTersimpan> {
  const nilai =
    input.jenis === "REPORTIT"
      ? {
          jenis: input.jenis,
          idPengguna: input.idPengguna,
          judul: input.judul,
          waktuKejadian: input.waktu,
          lokasiTeks: input.lokasi,
          latitude: input.latitude,
          longitude: input.longitude,
          sumber: input.sumber,
          jenisSampah: input.jenisSampah,
          lokasiId: null,
        }
      : {
          jenis: input.jenis,
          idPengguna: input.idPengguna,
          judul: input.judul,
          waktuKejadian: input.waktu,
          lokasiTeks: null,
          latitude: null,
          longitude: null,
          sumber: null,
          jenisSampah: null,
          lokasiId: input.lokasiId,
        };

  const [row] = await tx.insert(laporan).values(nilai).returning(kolomLaporan);
  return row;
}

/** Cari satu laporan berdasarkan ID; `null` jika tidak ada. */
export async function getLaporanById(idLaporan: number, tx: Eksekutor = db): Promise<LaporanTersimpan | null> {
  const [row] = await tx
    .select(kolomLaporan)
    .from(laporan)
    .where(eq(laporan.id, idLaporan))
    .limit(1);
  return row ?? null;
}

/** List berdasarkan filter, urut waktu masuk (`created_at`), dengan pagination dan total terfilter. */
export async function getDaftarLaporan(
  filter: FilterDaftarLaporan,
  tx: Eksekutor = db,
): Promise<{ data: LaporanTersimpan[]; total: number }> {
  const where = kondisiFilter(filter);
  const [{ total }] = await tx.select({ total: count() }).from(laporan).where(where);

  const arah = filter.sort === "terlama" ? asc : desc;
  const data = await tx
    .select(kolomLaporan)
    .from(laporan)
    .where(where)
    .orderBy(arah(laporan.createdAt), arah(laporan.id))
    .limit(filter.limit)
    .offset((filter.page - 1) * filter.limit);

  return { data, total };
}

/** Cek CleanIt BELUM_DIPERIKSA untuk pengguna/lokasi; dipakai oleh validator BE-10. */
export async function adaCleanItMenunggu(
  idPengguna: string,
  lokasiId: number,
  tx: Pick<Db, "select"> = db,
): Promise<boolean> {
  const [baris] = await tx
    .select({ id: laporan.id })
    .from(laporan)
    .where(
      and(
        eq(laporan.jenis, "CLEANIT"),
        eq(laporan.idPengguna, idPengguna),
        eq(laporan.lokasiId, lokasiId),
        eq(laporan.status, "BELUM_DIPERIKSA"),
      ),
    )
    .limit(1);

  return baris !== undefined;
}

/** Ubah status dan metadata verifikasi; kembalikan `null` bila ID tidak ditemukan. */
export async function ubah_status(
  idLaporan: number,
  perubahan: PerubahanStatusLaporan,
  tx: Eksekutor = db,
): Promise<LaporanTersimpan | null> {
  const nilai =
    perubahan.status === "BELUM_DIPERIKSA"
      ? { status: perubahan.status, diverifikasiOleh: null, diverifikasiAt: null }
      : {
          status: perubahan.status,
          diverifikasiOleh: perubahan.diverifikasiOleh,
          diverifikasiAt: perubahan.diverifikasiAt,
        };
  const [row] = await tx
    .update(laporan)
    .set(nilai)
    .where(eq(laporan.id, idLaporan))
    .returning(kolomLaporan);
  return row ?? null;
}

/** Simpan alasan penolakan; kembalikan `null` bila ID tidak ditemukan. */
export async function simpan_alasan_penolakan(
  idLaporan: number,
  alasanPenolakan: string,
  tx: Eksekutor = db,
): Promise<LaporanTersimpan | null> {
  const [row] = await tx
    .update(laporan)
    .set({ alasanPenolakan })
    .where(eq(laporan.id, idLaporan))
    .returning(kolomLaporan);
  return row ?? null;
}

/**
 * Jumlah CleanIt pengguna untuk lokasi yang ia laporkan sendiri dalam 30 hari terakhir
 * (berdasarkan `created_at`), tidak termasuk laporan `kecualiIdLaporan` (Aturan CleanIt nomor 6).
 * Semua status dihitung, supaya Operator melihat seberapa sering pola ini terjadi.
 */
export async function hitungBersihkanSendiri30Hari(
  idPengguna: string,
  kecualiIdLaporan: number,
  tx: Pick<Db, "select"> = db,
): Promise<number> {
  const asal = alias(laporan, "laporan_asal");
  const [{ jumlah }] = await tx
    .select({ jumlah: count() })
    .from(laporan)
    .innerJoin(lokasi, eq(lokasi.id, laporan.lokasiId))
    .innerJoin(asal, eq(asal.id, lokasi.laporanAsalId))
    .where(
      and(
        eq(laporan.jenis, "CLEANIT"),
        eq(laporan.idPengguna, idPengguna),
        eq(asal.idPengguna, idPengguna),
        ne(laporan.id, kecualiIdLaporan),
        gte(laporan.createdAt, sql`now() - interval '30 days'`),
      ),
    );
  return jumlah;
}

/** Keputusan verifikasi Operator untuk satu laporan. */
export type KeputusanVerifikasi = {
  status: "VALID" | "TIDAK_VALID";
  diverifikasiOleh: string;
  /** Wajib untuk CleanIt yang ditolak (CHECK laporan_alasan_cleanit_check). */
  alasanPenolakan?: string | null;
};

/**
 * Ubah status verifikasi hanya jika laporan masih BELUM_DIPERIKSA (BE-16). Status, alasan,
 * `diverifikasi_oleh`, dan `diverifikasi_at` diisi dalam satu UPDATE, supaya CHECK alasan CleanIt
 * dan CHECK status–verifikasi selalu terpenuhi. Mengembalikan `null` jika tidak ada baris yang
 * berubah (laporan tidak ada atau sudah diverifikasi); dua verifikasi bersamaan hanya satu yang
 * berhasil karena UPDATE kedua menunggu kunci baris lalu mengevaluasi ulang syarat status.
 */
export async function ubah_status_verifikasi(
  idLaporan: number,
  keputusan: KeputusanVerifikasi,
  tx: Eksekutor = db,
): Promise<LaporanTersimpan | null> {
  const [row] = await tx
    .update(laporan)
    .set({
      status: keputusan.status,
      alasanPenolakan: keputusan.alasanPenolakan ?? null,
      diverifikasiOleh: keputusan.diverifikasiOleh,
      diverifikasiAt: sql`now()`,
    })
    .where(and(eq(laporan.id, idLaporan), eq(laporan.status, "BELUM_DIPERIKSA")))
    .returning(kolomLaporan);
  return row ?? null;
}

/** Isi `laporan.lokasi_id` ReportIt yang disetujui dengan lokasi baru atau lokasi tujuan penggabungan. */
export async function tautkanLokasi(
  idLaporan: number,
  idLokasi: number,
  tx: Pick<Db, "update"> = db,
): Promise<void> {
  await tx.update(laporan).set({ lokasiId: idLokasi }).where(eq(laporan.id, idLaporan));
}

/** Alasan penolakan otomatis CleanIt lain setelah lokasinya dibersihkan (K12). */
export const ALASAN_LOKASI_SUDAH_DIBERSIHKAN = "Lokasi sudah dibersihkan";

/**
 * Tolak otomatis CleanIt lain yang masih menunggu untuk lokasi yang baru dibersihkan (K12).
 * `diverifikasi_oleh` = Operator yang menyetujui. Dijalankan setelah UPDATE lokasi, sehingga
 * CleanIt yang tersimpan selama UPDATE lokasi menunggu kunci ikut tertolak (statement baru di
 * READ COMMITTED melihat baris yang sudah di-commit). Mengembalikan ID laporan yang ditolak.
 */
export async function tolakCleanItMenungguLain(
  idLokasi: number,
  kecualiIdLaporan: number,
  diverifikasiOleh: string,
  tx: Pick<Db, "update"> = db,
): Promise<number[]> {
  const rows = await tx
    .update(laporan)
    .set({
      status: "TIDAK_VALID",
      alasanPenolakan: ALASAN_LOKASI_SUDAH_DIBERSIHKAN,
      diverifikasiOleh,
      diverifikasiAt: sql`now()`,
    })
    .where(
      and(
        eq(laporan.jenis, "CLEANIT"),
        eq(laporan.lokasiId, idLokasi),
        eq(laporan.status, "BELUM_DIPERIKSA"),
        ne(laporan.id, kecualiIdLaporan),
      ),
    )
    .returning({ idLaporan: laporan.id });
  return rows.map((row) => row.idLaporan);
}

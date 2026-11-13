/**
 * Data sintetis untuk profiling (BE-26). Hanya untuk database `*_test`: semua tabel dikosongkan
 * lalu diisi ±10.000 lokasi beserta ReportIt asalnya dan ±10.000 laporan antrean Operator.
 *
 * Data dibuat langsung dengan SQL `generate_series` supaya cepat dan bisa diulang persis sama
 * (`setseed`). Koordinat lokasi berada di dalam kotak wilayah kerja sama (K10), seperti data asli.
 */
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { WILAYAH } from "@/lib/wilayah";

export const JUMLAH_LOKASI = 10_000;
export const JUMLAH_REPORTIT_MENUNGGU = 6_000;
export const JUMLAH_CLEANIT_MENUNGGU = 4_000;
export const JUMLAH_REPORTIT_DITOLAK = 2_000;
const JUMLAH_MASYARAKAT = 50;

type Db = NodePgDatabase<Record<string, unknown>>;

/** Ekspresi SQL titik acak di dalam wilayah ke-(g mod 3), memakai kolom `g` dari generate_series. */
function titikAcak() {
  const kasus = (sumbu: "lat" | "lng") =>
    sql.join(
      WILAYAH.map((w, i) => {
        const [min, max] = sumbu === "lat" ? [w.latMin, w.latMax] : [w.lngMin, w.lngMax];
        return sql`WHEN ${sql.raw(String(i))} THEN ${sql.raw(String(min))} + random() * ${sql.raw(String(max - min))}`;
      }),
      sql` `,
    );
  return {
    lat: sql`CASE g % ${sql.raw(String(WILAYAH.length))} ${kasus("lat")} END`,
    lng: sql`CASE g % ${sql.raw(String(WILAYAH.length))} ${kasus("lng")} END`,
  };
}

/** Kosongkan semua tabel lalu isi data profiling dalam satu transaksi. */
export async function isiDataProfiling(db: Db): Promise<Record<string, number>> {
  const { lat, lng } = titikAcak();

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT setseed(0.2150)`);
    await tx.execute(sql`TRUNCATE penukaran, reward, media, laporan, lokasi, pengguna RESTART IDENTITY CASCADE`);

    await tx.execute(sql`
      INSERT INTO pengguna (nama, email, password_hash, role)
      SELECT 'Operator Profil', 'operator@profil.test', 'tidak-dipakai', 'OPERATOR'::role
      UNION ALL
      SELECT 'Masyarakat ' || g, 'masyarakat' || g || '@profil.test', 'tidak-dipakai', 'MASYARAKAT'::role
      FROM generate_series(1, ${JUMLAH_MASYARAKAT}) AS g`);

    // ReportIt asal (VALID) untuk setiap lokasi, dibuat dalam rentang 60 hari terakhir.
    await tx.execute(sql`
      INSERT INTO laporan (jenis, id_pengguna, judul, waktu_kejadian, lokasi_teks, latitude, longitude,
                           sumber, jenis_sampah, status, diverifikasi_oleh, diverifikasi_at, created_at)
      SELECT 'REPORTIT',
             (SELECT id FROM pengguna WHERE email = 'masyarakat' || (1 + g % ${JUMLAH_MASYARAKAT}) || '@profil.test'),
             'Laporan profil ' || g, waktu - interval '1 hour', 'Lokasi profil ' || g, ${lat}, ${lng},
             'PENGAMATAN_PRIBADI', 'PLASTIK', 'VALID',
             (SELECT id FROM pengguna WHERE role = 'OPERATOR'), waktu + interval '1 hour', waktu
      FROM (SELECT g, now() - random() * interval '60 days' AS waktu
            FROM generate_series(1, ${JUMLAH_LOKASI}) AS g) AS s`);

    // Satu lokasi per ReportIt asal; ±10% sudah DIBERSIHKAN.
    await tx.execute(sql`
      INSERT INTO lokasi (nama, alamat, latitude, longitude, jenis_sampah, status, poin, laporan_asal_id, created_at)
      SELECT lokasi_teks, lokasi_teks, latitude, longitude, jenis_sampah,
             CASE WHEN random() < 0.1 THEN 'DIBERSIHKAN'::status_lokasi ELSE 'TERCEMAR'::status_lokasi END,
             (ARRAY[50, 100, 200])[1 + floor(random() * 3)::int], id, diverifikasi_at
      FROM laporan ORDER BY id`);
    await tx.execute(sql`UPDATE laporan SET lokasi_id = l.id FROM lokasi l WHERE l.laporan_asal_id = laporan.id`);

    // Antrean Operator: ReportIt dan CleanIt yang masih BELUM_DIPERIKSA, plus ReportIt ditolak.
    await tx.execute(sql`
      INSERT INTO laporan (jenis, id_pengguna, judul, waktu_kejadian, lokasi_teks, latitude, longitude,
                           sumber, jenis_sampah, status, alasan_penolakan, diverifikasi_oleh, diverifikasi_at, created_at)
      SELECT 'REPORTIT',
             (SELECT id FROM pengguna WHERE email = 'masyarakat' || (1 + g % ${JUMLAH_MASYARAKAT}) || '@profil.test'),
             'Antrean profil ' || g, waktu - interval '1 hour', 'Antrean profil ' || g, ${lat}, ${lng},
             'INFO_WARGA', 'RUMAH_TANGGA',
             CASE WHEN g <= ${JUMLAH_REPORTIT_DITOLAK} THEN 'TIDAK_VALID'::status_laporan ELSE 'BELUM_DIPERIKSA'::status_laporan END,
             CASE WHEN g <= ${JUMLAH_REPORTIT_DITOLAK} THEN 'Data profil' END,
             CASE WHEN g <= ${JUMLAH_REPORTIT_DITOLAK} THEN (SELECT id FROM pengguna WHERE role = 'OPERATOR') END,
             CASE WHEN g <= ${JUMLAH_REPORTIT_DITOLAK} THEN waktu + interval '1 hour' END,
             waktu
      FROM (SELECT g, now() - random() * interval '30 days' AS waktu
            FROM generate_series(1, ${JUMLAH_REPORTIT_MENUNGGU + JUMLAH_REPORTIT_DITOLAK}) AS g) AS s`);

    // CleanIt menunggu: lokasi TERCEMAR berbeda-beda, jadi unique index CleanIt menunggu tidak bentrok.
    await tx.execute(sql`
      INSERT INTO laporan (jenis, id_pengguna, judul, waktu_kejadian, lokasi_id, status, created_at)
      SELECT 'CLEANIT',
             (SELECT id FROM pengguna WHERE email = 'masyarakat' || (1 + n % ${JUMLAH_MASYARAKAT}) || '@profil.test'),
             'Pembersihan profil ' || n, now() - random() * interval '7 days', id, 'BELUM_DIPERIKSA',
             now() - random() * interval '7 days'
      FROM (SELECT id, row_number() OVER (ORDER BY id) AS n FROM lokasi WHERE status = 'TERCEMAR') AS t
      WHERE n <= ${JUMLAH_CLEANIT_MENUNGGU}`);
  });

  await db.execute(sql`ANALYZE`);

  const { rows } = await db.execute<{ tabel: string; jumlah: number }>(sql`
    SELECT 'pengguna' AS tabel, count(*)::int AS jumlah FROM pengguna
    UNION ALL SELECT 'lokasi', count(*)::int FROM lokasi
    UNION ALL SELECT 'lokasi TERCEMAR', count(*)::int FROM lokasi WHERE status = 'TERCEMAR'
    UNION ALL SELECT 'laporan', count(*)::int FROM laporan
    UNION ALL SELECT 'laporan BELUM_DIPERIKSA', count(*)::int FROM laporan WHERE status = 'BELUM_DIPERIKSA'`);
  return Object.fromEntries(rows.map((r) => [r.tabel, r.jumlah]));
}

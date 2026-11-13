/**
 * Profiling query (BE-26): `docker compose exec -e POSTGRES_DB=soclean_test web npm run db:profil`
 * (dari folder `src/`). Tambahkan `-- --lewati-data` untuk mengukur ulang tanpa membuat data baru.
 *
 * Skrip ini MENGOSONGKAN database lalu mengisi data sintetis, jadi hanya mau berjalan pada
 * database yang namanya berakhiran `_test`. SQL yang diukur bukan salinan manual: fungsi model
 * dipanggil dengan instance Drizzle ber-logger, lalu SQL + parameter yang dihasilkan dijalankan
 * ulang dengan `EXPLAIN (ANALYZE, BUFFERS)` beberapa kali dan diambil median waktunya.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as LaporanModel from "@/server/models/laporan";
import * as LokasiModel from "@/server/models/lokasi";
import * as schema from "../schema";
import { isiDataProfiling } from "./data";

const ULANG = 7;

type Kueri = { query: string; params: unknown[] };
type HasilUkur = { skenario: string; medianMs: number; minMs: number; maksMs: number; rencana: string };

function konfigurasiDatabase() {
  const nama = process.env.POSTGRES_DB ?? "";
  if (!/^[a-z0-9_]+_test$/.test(nama)) {
    throw new Error(`Profiling ditolak: POSTGRES_DB="${nama}" bukan database *_test (data akan dihapus).`);
  }
  return {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: nama,
  };
}

/** Jalankan fungsi model dengan Drizzle ber-logger dan kembalikan SQL yang dihasilkannya. */
async function tangkapSql(
  pool: Pool,
  jalankan: (tx: ReturnType<typeof drizzle<typeof schema>>) => Promise<unknown>,
): Promise<Kueri[]> {
  const tertangkap: Kueri[] = [];
  const dbLog = drizzle(pool, {
    schema,
    logger: { logQuery: (query, params) => tertangkap.push({ query, params }) },
  });
  await jalankan(dbLog);
  return tertangkap;
}

async function ukur(pool: Pool, skenario: string, kueri: Kueri): Promise<HasilUkur> {
  const waktu: number[] = [];
  let rencana = "";
  for (let i = 0; i < ULANG; i++) {
    const { rows } = await pool.query(`EXPLAIN (ANALYZE, BUFFERS) ${kueri.query}`, kueri.params);
    rencana = rows.map((r: Record<string, string>) => r["QUERY PLAN"]).join("\n");
    const cocok = rencana.match(/Execution Time: ([\d.]+) ms/);
    if (!cocok) throw new Error(`Execution Time tidak ditemukan untuk ${skenario}`);
    waktu.push(Number(cocok[1]));
  }
  const urut = [...waktu].sort((a, b) => a - b);
  return {
    skenario,
    medianMs: urut[Math.floor(urut.length / 2)],
    minMs: urut[0],
    maksMs: urut[urut.length - 1],
    rencana,
  };
}

/** Node utama rencana (scan/sort/limit) untuk ringkasan tabel. */
function ringkasRencana(rencana: string): string {
  return rencana
    .split("\n")
    .map((baris) => baris.replace(/^\s*(->\s*)?/, "").replace(/\s+\(cost=.*$/, ""))
    .filter((baris) => /Scan|Sort|Limit|Aggregate/.test(baris))
    .slice(0, 4)
    .join(" → ");
}

async function main() {
  const pool = new Pool(konfigurasiDatabase());
  try {
    if (!process.argv.includes("--lewati-data")) {
      console.log("Mengisi data profiling...");
      console.table(await isiDataProfiling(drizzle(pool)));
    }

    const hasil: HasilUkur[] = [];

    // (1) Kandidat lokasi TERCEMAR ≤ 50 m (K13), dari titik ReportIt antrean di tiap wilayah.
    const { rows: titik } = await pool.query<{ latitude: number; longitude: number }>(`
      SELECT DISTINCT ON (round(latitude::numeric, 0)) latitude, longitude
      FROM laporan WHERE jenis = 'REPORTIT' AND status = 'BELUM_DIPERIKSA'
      ORDER BY round(latitude::numeric, 0), id`);
    for (const t of titik) {
      const [kueri] = await tangkapSql(pool, (tx) => LokasiModel.cariTerdekatTercemar(t.latitude, t.longitude, tx));
      hasil.push(await ukur(pool, `lokasi ≤ 50 m (${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)})`, kueri));
    }

    // (2) Daftar laporan Operator: query count (meta.total) dan query data per halaman.
    const daftar: [string, LaporanModel.FilterDaftarLaporan][] = [
      ["daftar REPORTIT hal. 1", { jenis: "REPORTIT", status: "BELUM_DIPERIKSA", sort: "terbaru", page: 1, limit: 6 }],
      ["daftar CLEANIT hal. 1", { jenis: "CLEANIT", status: "BELUM_DIPERIKSA", sort: "terbaru", page: 1, limit: 6 }],
      ["daftar REPORTIT hal. 1000", { jenis: "REPORTIT", status: "BELUM_DIPERIKSA", sort: "terbaru", page: 1000, limit: 6 }],
      ["daftar tanpa jenis hal. 1", { status: "BELUM_DIPERIKSA", sort: "terbaru", page: 1, limit: 6 }],
    ];
    for (const [nama, filter] of daftar) {
      const [hitung, data] = await tangkapSql(pool, (tx) => LaporanModel.getDaftarLaporan(filter, tx));
      hasil.push(await ukur(pool, `${nama} — count`, hitung));
      hasil.push(await ukur(pool, `${nama} — data`, data));
    }

    console.log(`\n## Ringkasan (median dari ${ULANG} kali EXPLAIN ANALYZE)\n`);
    console.log("| Skenario | Median (ms) | Min–maks (ms) | Rencana |");
    console.log("| --- | --- | --- | --- |");
    for (const h of hasil) {
      console.log(`| ${h.skenario} | ${h.medianMs.toFixed(3)} | ${h.minMs.toFixed(3)}–${h.maksMs.toFixed(3)} | ${ringkasRencana(h.rencana)} |`);
    }
    for (const h of hasil) {
      console.log(`\n### ${h.skenario}\n\n${h.rencana}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Profiling gagal:", err);
  process.exitCode = 1;
});

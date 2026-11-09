/**
 * Global setup Vitest: menyiapkan database test sebelum test integrasi berjalan.
 *
 * Jika database `POSTGRES_DB` (berakhiran `_test`) belum ada, database dibuat lewat database
 * `postgres`, lalu semua migrasi di `server/db/migrations/` diterapkan. Tanpa database test,
 * setup ini tidak melakukan apa pun.
 */
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";
import { DATABASE_TEST_AKTIF } from "./database-test";

function koneksi(database: string) {
  return {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database,
  };
}

export default async function setup(): Promise<void> {
  if (!DATABASE_TEST_AKTIF) return;
  // Nama sudah dicek berpola [a-z0-9_]+_test, jadi aman dipakai sebagai identifier.
  const namaDatabase = process.env.POSTGRES_DB as string;

  const admin = new Client(koneksi("postgres"));
  await admin.connect();
  try {
    const ada = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [namaDatabase]);
    if (ada.rowCount === 0) await admin.query(`CREATE DATABASE "${namaDatabase}"`);
  } finally {
    await admin.end();
  }

  const pool = new Pool(koneksi(namaDatabase));
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL("../../server/db/migrations", import.meta.url)),
    });
  } finally {
    await pool.end();
  }
}

/**
 * Koneksi database (Drizzle + node-postgres).
 * Model boleh mengimpor `db` untuk query. Controller boleh mengimpornya hanya
 * untuk membuka `db.transaction(...)`, lalu meneruskan `tx` ke fungsi model;
 * controller tidak boleh menjalankan query langsung. View dan kode bersama
 * (`lib/`, `types/`) tidak boleh mengimpor file ini.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Saat `next dev`, modul di-reload berkali-kali; simpan pool di globalThis agar koneksi tidak menumpuk.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;

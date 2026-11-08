/**
 * Skema database (Drizzle), satu file per tabel. File ini menyatukan semuanya untuk
 * `server/db/index.ts` dan `drizzle.config.ts`. Sumber: bagian "Skema database" kontrak v0.7.
 *
 * Nama kolom di database snake_case; nama properti TypeScript camelCase.
 *
 * Mengubah skema: edit file tabel terkait (atau tambah file baru dan export di sini),
 * lalu `npm run db:generate` untuk membuat file migrasi baru di `server/db/migrations/`.
 * Jangan mengedit file migrasi yang sudah di-commit.
 */
export * from "./enums";
export * from "./pengguna";
export * from "./media";
export * from "./lokasi";
export * from "./laporan";
export * from "./reward";
export * from "./penukaran";

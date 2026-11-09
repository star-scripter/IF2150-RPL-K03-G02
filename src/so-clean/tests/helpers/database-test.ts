/**
 * Penanda database test untuk test integrasi BE.
 *
 * Test integrasi hanya berjalan jika `POSTGRES_DB` berakhiran `_test`, supaya tidak pernah
 * mengosongkan database development (`soclean_dev`). Tanpa itu, test integrasi di-skip dan
 * `npm test` tetap bisa dijalankan tanpa database. Cara menjalankan (dari folder `src/`):
 *
 *   docker compose exec -e POSTGRES_DB=soclean_test web npm test
 *
 * Aturan yang sama dipakai `vitest.config.mts` untuk menjalankan file test berurutan.
 */
export const DATABASE_TEST_AKTIF = /^[a-z0-9_]+_test$/.test(process.env.POSTGRES_DB ?? "");

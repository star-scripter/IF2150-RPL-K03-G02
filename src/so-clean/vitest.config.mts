import { defineConfig } from "vitest/config";

// Sama dengan DATABASE_TEST_AKTIF di tests/helpers/database-test.ts (tidak diimpor agar config
// tetap dimuat sebagai ESM murni oleh Vite).
const databaseTestAktif = /^[a-z0-9_]+_test$/.test(process.env.POSTGRES_DB ?? "");

export default defineConfig({
  // Kode server mengimpor dengan alias `@/` (tsconfig `paths`), sama seperti di Next.js.
  resolve: { tsconfigPaths: true },
  test: {
    // Membuat dan memigrasi database `*_test` sekali sebelum semua test (lihat tests/helpers/).
    globalSetup: ["./tests/helpers/global-setup.ts"],
    // Test integrasi memakai satu database dan mengosongkan tabel di setiap test, jadi file test
    // dijalankan berurutan saat database test aktif. Tanpa database test, tetap paralel.
    fileParallelism: !databaseTestAktif,
  },
});

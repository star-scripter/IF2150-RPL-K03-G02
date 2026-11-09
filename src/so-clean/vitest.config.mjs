import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = dirname(fileURLToPath(import.meta.url));

// Sama dengan DATABASE_TEST_AKTIF di tests/helpers/database-test.ts (tidak diimpor agar config
// tetap dimuat sebagai ESM murni oleh Vite).
const databaseTestAktif = /^[a-z0-9_]+_test$/.test(process.env.POSTGRES_DB ?? "");

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(projectRoot),
    },
  },
  test: {
    environment: "node",
    // Membuat dan memigrasi database `*_test` sekali sebelum semua test (lihat tests/helpers/).
    globalSetup: ["./tests/helpers/global-setup.ts"],
    // Test integrasi memakai satu database dan mengosongkan tabel di setiap test, jadi file test
    // dijalankan berurutan saat database test aktif. Tanpa database test, tetap paralel.
    fileParallelism: !databaseTestAktif,
  },
});

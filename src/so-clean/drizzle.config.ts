import { defineConfig } from "drizzle-kit";

// Kredensial dibaca dari env yang sama dengan aplikasi (diset oleh docker compose).
// Jalankan perintah db:* dari dalam container web, mis. `docker compose exec web npm run db:migrate`.
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema/index.ts",
  out: "./server/db/migrations",
  dbCredentials: {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? "soclean_dev",
    ssl: false,
  },
  strict: true,
  verbose: true,
});

/**
 * Menjalankan seed: `docker compose exec web npm run db:seed` (dari folder `src/`).
 *
 * MENGHAPUS semua data lalu mengisi data contoh fiktif. Ditolak jika NODE_ENV=production,
 * kecuali dijalankan dengan `npm run db:seed -- --paksa`.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { db } from "../index";
import { PASSWORD_UJI, AKUN } from "./data";
import { seed, type Unggah } from "./seed";

function buatUnggah(): Unggah | undefined {
  const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return undefined;

  const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    // Checksum hanya jika diwajibkan: kompatibel dengan server S3 selain AWS (RustFS, R2).
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return async (key, isi, contentType) => {
    await client.send(
      new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: isi, ContentType: contentType }),
    );
  };
}

async function main() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--paksa")) {
    console.error("Seed ditolak: NODE_ENV=production. Seed menghapus semua data. Pakai --paksa jika yakin.");
    process.exit(1);
  }

  await seed(db, buatUnggah());

  console.log(`\nAkun uji (password semua akun: ${PASSWORD_UJI}):`);
  for (const a of AKUN) console.log(`  ${a.role.padEnd(10)} ${a.email}`);
}

main()
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());

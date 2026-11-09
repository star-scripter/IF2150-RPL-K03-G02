/**
 * Storage adapter S3 (RustFS di lokal, Cloudflare R2 di produksi) — bagian baca.
 *
 * SHIM SEMENTARA (BE-B): adapter lengkap `upload(file)` + `getUrl(key)` adalah tugas BE-07
 * (BE-A) dan belum ada di `dev`. File ini hanya berisi `getUrl` yang dibutuhkan endpoint baca
 * BE-B (detail lokasi, detail laporan). Saat BE-07 merge, pakai `getUrl` dari BE-07 lalu hapus
 * file ini jika lokasinya berbeda.
 *
 * Database hanya menyimpan `storage_key`; URL dibuat saat dibaca karena presigned URL punya
 * masa berlaku. URL ditandatangani dengan `S3_PUBLIC_ENDPOINT` (bukan `S3_ENDPOINT`) agar bisa
 * dibuka dari browser.
 */
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** Masa berlaku presigned URL media. */
export const MASA_BERLAKU_URL_DETIK = 60 * 60;

let klienPublik: S3Client | undefined;

function wajibEnv(nama: string): string {
  const nilai = process.env[nama];
  if (!nilai) throw new Error(`${nama} belum dikonfigurasi.`);
  return nilai;
}

function klienUntukUrl(): S3Client {
  klienPublik ??= new S3Client({
    endpoint: wajibEnv("S3_PUBLIC_ENDPOINT"),
    region: process.env.S3_REGION || "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: wajibEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: wajibEnv("S3_SECRET_ACCESS_KEY"),
    },
    // Sama dengan seed: checksum hanya jika diwajibkan, agar kompatibel dengan RustFS dan R2.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return klienPublik;
}

/** Presigned URL (GET) untuk objek `key`, berlaku `MASA_BERLAKU_URL_DETIK` detik. */
export async function getUrl(key: string): Promise<string> {
  const perintah = new GetObjectCommand({ Bucket: wajibEnv("S3_BUCKET"), Key: key });
  return getSignedUrl(klienUntukUrl(), perintah, { expiresIn: MASA_BERLAKU_URL_DETIK });
}

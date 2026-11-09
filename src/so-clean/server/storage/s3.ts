import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const PRESIGNED_READ_URL_TTL_SECONDS = 60 * 60;

export type S3StorageConfig = {
  endpoint: string;
  publicEndpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

/** Bentuk minimum file dari Request.formData(), tanpa mengikat adapter ke Route Handler. */
export type UploadFile = Pick<File, "arrayBuffer" | "type">;

export type S3StorageAdapter = {
  /** Unggah object dan kembalikan storage key untuk disimpan di database. */
  upload(file: UploadFile): Promise<string>;
  /** Buat presigned read URL menggunakan endpoint yang dapat dijangkau browser. */
  getUrl(key: string): Promise<string>;
};

type StorageEnvironment = Record<string, string | undefined>;

function requiredEnv(env: StorageEnvironment, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Variabel environment ${name} wajib diatur untuk object storage.`);
  return value;
}

function endpointEnv(env: StorageEnvironment, name: string): string {
  const value = requiredEnv(env, name);
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} harus berupa URL http(s) yang valid.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} harus menggunakan protokol http atau https.`);
  }

  return value;
}

/** Baca konfigurasi S3 hanya dari environment; tidak ada kredensial default/hard-coded. */
export function readS3StorageConfig(env: StorageEnvironment = process.env): S3StorageConfig {
  const endpoint = endpointEnv(env, "S3_ENDPOINT");
  const publicEndpoint = endpointEnv(env, "S3_PUBLIC_ENDPOINT");
  const region = requiredEnv(env, "S3_REGION");
  const bucket = requiredEnv(env, "S3_BUCKET");
  const accessKeyId = requiredEnv(env, "S3_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv(env, "S3_SECRET_ACCESS_KEY");
  const forcePathStyle = requiredEnv(env, "S3_FORCE_PATH_STYLE").toLowerCase();
  if (forcePathStyle !== "true" && forcePathStyle !== "false") {
    throw new Error("S3_FORCE_PATH_STYLE harus bernilai true atau false.");
  }

  return {
    endpoint,
    publicEndpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: forcePathStyle === "true",
  };
}

/**
 * Adapter S3-compatible. Upload menggunakan S3_ENDPOINT (server/internal),
 * sedangkan penandatanganan URL menggunakan S3_PUBLIC_ENDPOINT (browser/public).
 */
export function createS3StorageAdapter(config: S3StorageConfig): S3StorageAdapter {
  const credentials = {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  };
  const sharedConfig = {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials,
    // Kompatibel dengan RustFS/R2; checksum tidak dipaksakan jika tidak diwajibkan.
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  };

  const uploadClient = new S3Client({ ...sharedConfig, endpoint: config.endpoint });
  const publicClient =
    config.publicEndpoint === config.endpoint
      ? uploadClient
      : new S3Client({ ...sharedConfig, endpoint: config.publicEndpoint });

  return {
    async upload(file) {
      const key = `media/${randomUUID()}`;
      const body = Buffer.from(await file.arrayBuffer());

      await uploadClient.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: file.type || "application/octet-stream",
        }),
      );

      return key;
    },

    async getUrl(key) {
      if (!key || key.trim() === "") throw new Error("Storage key tidak boleh kosong.");

      return getSignedUrl(
        publicClient,
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
        { expiresIn: PRESIGNED_READ_URL_TTL_SECONDS },
      );
    },
  };
}

let defaultAdapter: S3StorageAdapter | undefined;

function storage(): S3StorageAdapter {
  defaultAdapter ??= createS3StorageAdapter(readS3StorageConfig());
  return defaultAdapter;
}

/** BE-07: unggah file dan kembalikan object key, bukan URL. */
export async function upload(file: UploadFile): Promise<string> {
  return storage().upload(file);
}

/** BE-07: buat presigned read URL dengan S3_PUBLIC_ENDPOINT. */
export async function getUrl(key: string): Promise<string> {
  return storage().getUrl(key);
}

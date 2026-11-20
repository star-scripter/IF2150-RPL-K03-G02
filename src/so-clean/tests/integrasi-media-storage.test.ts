/**
 * Test integrasi aplikasi → penyimpanan S3 (HIUPL 4.3, IF-07), tanpa mock: route `POST /api/media`,
 * controller media, pemrosesan `sharp`, adapter S3 ke RustFS, dan tabel `media` di PostgreSQL.
 *
 * Hanya berjalan dengan database `*_test` dan konfigurasi S3 (di container `web`). Objek yang
 * diunggah dihapus kembali dari bucket setelah test.
 */
import { createHash } from "node:crypto";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/media/route";
import { db } from "@/server/db";
import { media } from "@/server/db/schema";
import { DATABASE_TEST_AKTIF, buatLaporan, buatPengguna, kosongkanDatabase } from "./helpers/db";
import { cookieSesi } from "./helpers/sesi";

const S3_AKTIF = Boolean(process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID);
const kunciDiunggah: string[] = [];

/** Gambar PNG 64×64 dengan warna acak, sehingga hash-nya unik di setiap run. */
async function buatPng(): Promise<Buffer> {
  const warna = { r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: 120 };
  return sharp({ create: { width: 64, height: 64, channels: 3, background: warna } }).png().toBuffer();
}

async function unggah(isi: Buffer, idPengguna: string) {
  const form = new FormData();
  form.append("file", new File([new Uint8Array(isi)], "bukti.png", { type: "image/png" }));
  const request = new Request("http://localhost/api/media", {
    method: "POST",
    headers: { cookie: await cookieSesi(idPengguna, "MASYARAKAT") },
    body: form,
  });
  return POST(request);
}

const sha256 = (b: Buffer | Uint8Array) => createHash("sha256").update(b).digest("hex");

describe.runIf(DATABASE_TEST_AKTIF && S3_AKTIF)("IF-07: POST /api/media → RustFS (S3) dan tabel media", () => {
  beforeAll(() => {
    // Presigned URL harus bisa diambil dari dalam container, jadi pakai endpoint internal RustFS.
    vi.stubEnv("S3_PUBLIC_ENDPOINT", process.env.S3_ENDPOINT as string);
  });

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    const klien = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });
    for (const Key of kunciDiunggah) {
      await klien.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key }));
    }
  });

  it("menyimpan foto ber-watermark di RustFS, mencatat hash file asli di database, dan URL bisa diambil", async () => {
    const { id } = await buatPengguna();
    const asli = await buatPng();

    const res = await unggah(asli, id);
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data).toMatchObject({ idMedia: expect.any(Number), tipe: "FOTO" });

    const [row] = await db.select().from(media).where(eq(media.id, data.idMedia));
    kunciDiunggah.push(row.storageKey);
    expect(row).toMatchObject({ idPengguna: id, laporanId: null, tipe: "FOTO", ukuranByte: asli.length });
    expect(row.sha256).toBe(sha256(asli));

    // Objek benar-benar ada di RustFS dan berupa gambar hasil watermark (berbeda dari file asli).
    const ambil = await fetch(data.url);
    expect(ambil.status).toBe(200);
    const tersimpan = new Uint8Array(await ambil.arrayBuffer());
    expect((await sharp(tersimpan).metadata()).format).toBeDefined();
    expect(sha256(tersimpan)).not.toBe(sha256(asli));
  });

  it("URL dengan tanda tangan diubah ditolak RustFS", async () => {
    const { id } = await buatPengguna();
    const res = await unggah(await buatPng(), id);
    const { data } = await res.json();
    const [row] = await db.select().from(media).where(eq(media.id, data.idMedia));
    kunciDiunggah.push(row.storageKey);

    const url = new URL(data.url);
    const tanda = url.searchParams.get("X-Amz-Signature") as string;
    url.searchParams.set("X-Amz-Signature", (tanda[0] === "a" ? "b" : "a") + tanda.slice(1));
    const ambil = await fetch(url);
    expect(ambil.status).toBe(403);
  });

  it("file identik dengan media laporan aktif ditolak 409 sebelum diunggah lagi", async () => {
    const { id } = await buatPengguna();
    const asli = await buatPng();
    const pertama = await (await unggah(asli, id)).json();
    const [row] = await db.select().from(media).where(eq(media.id, pertama.data.idMedia));
    kunciDiunggah.push(row.storageKey);
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: id });
    await db.update(media).set({ laporanId: idLaporan }).where(eq(media.id, row.id));

    const kedua = await unggah(asli, id);

    expect(kedua.status).toBe(409);
    expect((await kedua.json()).error.code).toBe("MEDIA_SUDAH_DIGUNAKAN");
    expect(await db.select().from(media)).toHaveLength(1);
  });
});

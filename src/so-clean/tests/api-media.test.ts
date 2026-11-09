import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/media/route";
import { MAKS_UKURAN_MEDIA_BYTE } from "@/server/media/processing";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const mocks = vi.hoisted(() => ({
  sudahDipakai: vi.fn(),
  buatMedia: vi.fn(),
  upload: vi.fn(),
  getUrl: vi.fn(),
}));

vi.mock("@/server/models/media", () => ({
  sudahDipakai: mocks.sudahDipakai,
  buatMedia: mocks.buatMedia,
}));

vi.mock("@/server/storage/s3", () => ({
  upload: mocks.upload,
  getUrl: mocks.getUrl,
}));

function bytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(new ArrayBuffer(buffer.length));
  output.set(buffer);
  return output;
}

async function requestUpload(file?: File, role: "MASYARAKAT" | "OPERATOR" = "MASYARAKAT") {
  const form = new FormData();
  if (file) form.append("file", file);
  const cookie = await cookieSesi(randomUUID(), role);
  return POST(
    new Request("http://localhost/api/media", {
      method: "POST",
      headers: { cookie },
      body: form,
    }),
  );
}

describe("POST /api/media", () => {
  beforeEach(() => {
    mocks.sudahDipakai.mockReset().mockResolvedValue(false);
    mocks.buatMedia.mockReset().mockResolvedValue(42);
    mocks.upload.mockReset().mockResolvedValue("media/test-key");
    mocks.getUrl.mockReset().mockResolvedValue("https://media.example.test/signed-read-url");
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menolak request tanpa sesi dan role Operator", async () => {
    const guest = await POST(buatRequest("/api/media", { method: "POST" }));
    expect(guest.status).toBe(401);
    expect((await guest.json()).error.code).toBe("UNAUTHORIZED");

    const operator = await requestUpload(undefined, "OPERATOR");
    expect(operator.status).toBe(403);
    expect((await operator.json()).error.code).toBe("FORBIDDEN");
  });

  it("menolak field file yang hilang", async () => {
    const response = await requestUpload();
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("DATA_TIDAK_LENGKAP");
  });

  it("menolak file lebih dari 20 MB dengan 413", async () => {
    const file = new File(
      [new Uint8Array(MAKS_UKURAN_MEDIA_BYTE + 1)],
      "large.png",
      { type: "image/png" },
    );
    const response = await requestUpload(file);
    expect(response.status).toBe(413);
    expect((await response.json()).error.code).toBe("FILE_TERLALU_BESAR");
    expect(mocks.sudahDipakai).not.toHaveBeenCalled();
  });

  it("menolak tipe atau signature yang tidak didukung dengan 415", async () => {
    const file = new File(["not a png"], "evidence.png", { type: "image/png" });
    const response = await requestUpload(file);
    expect(response.status).toBe(415);
    expect((await response.json()).error.code).toBe("TIPE_FILE_TIDAK_DIDUKUNG");
    expect(mocks.sudahDipakai).not.toHaveBeenCalled();
  });

  it("menolak hash media yang sudah digunakan tanpa upload", async () => {
    const png = await sharp({
      create: { width: 20, height: 20, channels: 3, background: "white" },
    }).png().toBuffer();
    mocks.sudahDipakai.mockResolvedValue(true);
    const response = await requestUpload(new File([bytes(png)], "used.png", { type: "image/png" }));

    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("MEDIA_SUDAH_DIGUNAKAN");
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.buatMedia).not.toHaveBeenCalled();
  });

  it("menghash file asli, memberi watermark sebelum upload, dan mengembalikan respons kontrak", async () => {
    const png = await sharp({
      create: { width: 100, height: 80, channels: 3, background: { r: 10, g: 20, b: 30 } },
    }).png().toBuffer();
    const response = await requestUpload(new File([bytes(png)], "evidence.png", { type: "image/png" }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      data: { idMedia: 42, url: "https://media.example.test/signed-read-url", tipe: "FOTO" },
    });
    expect(mocks.sudahDipakai).toHaveBeenCalledWith(expect.stringMatching(/^[0-9a-f]{64}$/));
    expect(mocks.buatMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        storageKey: "media/test-key",
        tipe: "FOTO",
        ukuranByte: png.length,
        sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        createdAt: expect.any(Date),
      }),
    );
    const [uploaded] = mocks.upload.mock.calls[0] as [Blob];
    const uploadedBytes = Buffer.from(await uploaded.arrayBuffer());
    expect(uploadedBytes.equals(png)).toBe(false);
    expect((await sharp(uploadedBytes).metadata()).format).toBe("png");
    expect(mocks.getUrl).toHaveBeenCalledWith("media/test-key");
  });

  it("mengunggah MP4 tanpa mengubah isi videonya", async () => {
    const mp4 = Buffer.alloc(24);
    mp4.writeUInt32BE(mp4.length, 0);
    mp4.write("ftyp", 4);
    mp4.write("isom", 8);
    mp4.write("isom", 12);
    const response = await requestUpload(new File([bytes(mp4)], "evidence.mp4", { type: "video/mp4" }));

    expect(response.status).toBe(201);
    expect((await response.json()).data.tipe).toBe("VIDEO");
    const [uploaded] = mocks.upload.mock.calls[0] as [Blob];
    expect(Buffer.from(await uploaded.arrayBuffer())).toEqual(mp4);
    expect(mocks.buatMedia).toHaveBeenCalledWith(expect.objectContaining({ tipe: "VIDEO", ukuranByte: mp4.length }));
  });
});

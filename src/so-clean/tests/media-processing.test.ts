import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { formatWaktuWatermark, prosesMediaAsli, validasiTipeMedia } from "../server/media/processing";

describe("pemrosesan bukti media", () => {
  it("memformat waktu watermark dalam WIB dengan format kontrak", () => {
    expect(formatWaktuWatermark(new Date("2026-11-09T10:05:00.000Z"))).toBe("09 Nov 2026 17.05 WIB");
  });

  it("memberi watermark pada foto dan mempertahankan format PNG", async () => {
    const original = await sharp({
      create: { width: 320, height: 240, channels: 3, background: { r: 20, g: 120, b: 210 } },
    })
      .png()
      .toBuffer();

    const result = await prosesMediaAsli(original, "image/png", new Date("2026-11-09T10:05:00.000Z"));
    const metadata = await sharp(result.buffer).metadata();
    const { data, info } = await sharp(result.buffer).raw().toBuffer({ resolveWithObject: true });
    const bottomLeft = data.subarray((info.height - 1) * info.width * info.channels, (info.height - 1) * info.width * info.channels + 3);

    expect(result).toMatchObject({ contentType: "image/png", tipe: "FOTO" });
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(320);
    expect([...bottomLeft]).not.toEqual([20, 120, 210]);
  });

  it("tidak mengubah byte video MP4", async () => {
    const video = Buffer.alloc(24);
    video.writeUInt32BE(video.length, 0);
    video.write("ftyp", 4);
    video.write("isom", 8);
    video.write("isom", 12);
    const result = await prosesMediaAsli(video, "video/mp4", new Date());

    expect(result).toEqual({ buffer: video, contentType: "video/mp4", tipe: "VIDEO" });
  });

  it("menolak MIME atau signature yang tidak didukung", () => {
    expect(() => validasiTipeMedia(Buffer.from("not an image"), "image/png")).toThrow(
      "File harus berupa JPG, PNG, atau MP4.",
    );
    expect(() => validasiTipeMedia(Buffer.from("not an image"), "text/plain")).toThrow(
      "File harus berupa JPG, PNG, atau MP4.",
    );
  });
});

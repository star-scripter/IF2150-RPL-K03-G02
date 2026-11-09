import sharp from "sharp";
import { ApiError } from "@/server/api";
import type { TipeMedia } from "@/types/api";

export const MAKS_UKURAN_MEDIA_BYTE = 20 * 1024 * 1024;

export type MediaDiproses = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "video/mp4";
  tipe: TipeMedia;
};

function tipeFileTidakDidukung(): ApiError {
  return new ApiError("TIPE_FILE_TIDAK_DIDUKUNG", "File harus berupa JPG, PNG, atau MP4.");
}

/** Format waktu watermark dengan zona waktu WIB, bukan zona waktu mesin server. */
export function formatWaktuWatermark(waktu: Date): string {
  const bagian = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(waktu);
  const nilai = Object.fromEntries(bagian.map(({ type, value }) => [type, value]));

  return `${nilai.day} ${nilai.month} ${nilai.year} ${nilai.hour}.${nilai.minute} WIB`;
}

function mimeDanFormatAsliSesuai(input: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") {
    return input.length >= 3 && input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff;
  }
  if (mime === "image/png") {
    return input.length >= 8 && input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mime === "video/mp4") {
    if (input.length < 12 || input.toString("ascii", 4, 8) !== "ftyp") return false;
    // MP4 brands umum; ini menolak HEIC/HEIF yang juga memakai box `ftyp`.
    const brand = input.toString("ascii", 8, 12);
    return ["isom", "iso2", "mp41", "mp42", "avc1", "M4V ", "MSNV", "dash", "3gp4", "3gp5", "3gp6"].includes(
      brand,
    );
  }
  return false;
}

/** Validasi deklarasi MIME sekaligus magic bytes sebelum hash/DB/storage. */
export function validasiTipeMedia(input: Buffer, mime: string): MediaDiproses["contentType"] {
  if (
    (mime !== "image/jpeg" && mime !== "image/png" && mime !== "video/mp4") ||
    !mimeDanFormatAsliSesuai(input, mime)
  ) {
    throw tipeFileTidakDidukung();
  }
  return mime;
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buatSvgWatermark(width: number, height: number, label: string): { buffer: Buffer; height: number } {
  const padding = Math.min(14, Math.max(1, width * 0.025));
  const fontSize = Math.max(
    1,
    Math.min(32, width * 0.035, height * 0.08, (width - padding * 2) / (label.length * 0.62)),
  );
  const stripHeight = Math.min(height, Math.max(22, Math.ceil(fontSize * 1.9 + padding)));
  const baseline = Math.min(stripHeight - 1, Math.ceil((stripHeight + fontSize * 0.68) / 2));
  const svg = `<svg width="${width}" height="${stripHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#000" fill-opacity="0.58"/><text x="${padding}" y="${baseline}" fill="#fff" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600">${escapeXml(label)}</text></svg>`;

  return { buffer: Buffer.from(svg), height: stripHeight };
}

/** Watermark hanya foto; video diteruskan byte-per-byte tanpa diubah. */
export async function prosesMediaAsli(
  input: Buffer,
  mime: string,
  waktuUnggah: Date,
): Promise<MediaDiproses> {
  const contentType = validasiTipeMedia(input, mime);

  if (contentType === "video/mp4") {
    return { buffer: input, contentType, tipe: "VIDEO" };
  }

  try {
    const metadata = await sharp(input, { failOn: "error" }).metadata();
    if (!metadata.width || !metadata.height || metadata.format !== (mime === "image/jpeg" ? "jpeg" : "png")) {
      throw tipeFileTidakDidukung();
    }

    const rotatesDimensions = metadata.orientation !== undefined && metadata.orientation >= 5 && metadata.orientation <= 8;
    const width = rotatesDimensions ? metadata.height : metadata.width;
    const height = rotatesDimensions ? metadata.width : metadata.height;
    const label = `SoClean · Diunggah ${formatWaktuWatermark(waktuUnggah)}`;
    const watermark = buatSvgWatermark(width, height, label);
    const buffer = await sharp(input, { failOn: "error" })
      .rotate()
      .composite([{ input: watermark.buffer, left: 0, top: height - watermark.height }])
      .toFormat(contentType === "image/jpeg" ? "jpeg" : "png", contentType === "image/jpeg" ? { quality: 90 } : { compressionLevel: 9 })
      .toBuffer();

    return {
      buffer,
      contentType,
      tipe: "FOTO",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw tipeFileTidakDidukung();
  }
}

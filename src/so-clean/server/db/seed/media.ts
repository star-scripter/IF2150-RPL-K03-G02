/**
 * Gambar placeholder untuk media seed. Bukan foto asli: latar berwarna, label "DATA CONTOH",
 * dan watermark bergaya K6. Pola kotak di pojok dibuat dari nomor urut media, sehingga setiap
 * gambar punya SHA-256 berbeda walaupun font tidak tersedia di container (teks bisa tidak
 * tergambar, pola tetap tergambar).
 */
import { createHash } from "node:crypto";
import sharp from "sharp";

const LEBAR = 800;
const TINGGI = 600;

function escapeXml(teks: string): string {
  return teks.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Format watermark K6: "SoClean · Diunggah dd MMM yyyy HH.mm WIB". */
export function teksWatermark(waktu: Date): string {
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(waktu);
  const jam = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(waktu)
    .replace(":", ".");
  return `SoClean · Diunggah ${tanggal} ${jam} WIB`;
}

export type GambarSeed = { isi: Buffer; sha256: string; ukuranByte: number };

/**
 * @param nomor   nomor urut unik media (dipakai untuk pola pembeda)
 * @param judul   judul laporan, ditulis di gambar
 * @param jenis   "sebelum" (ReportIt) atau "sesudah" (CleanIt)
 * @param waktu   waktu unggah untuk watermark
 */
export async function buatGambar(
  nomor: number,
  judul: string,
  jenis: "sebelum" | "sesudah",
  waktu: Date,
): Promise<GambarSeed> {
  const latar = jenis === "sebelum" ? "#8d6e63" : "#43a047";
  const label = jenis === "sebelum" ? "Kondisi tercemar" : "Sesudah dibersihkan";

  // 12 sel bit dari nomor media → pola unik per gambar.
  const sel = Array.from({ length: 12 }, (_, i) =>
    (nomor >> i) & 1
      ? `<rect x="${20 + (i % 6) * 22}" y="${20 + Math.floor(i / 6) * 22}" width="18" height="18" fill="#ffffff"/>`
      : "",
  ).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LEBAR}" height="${TINGGI}">
  <rect width="100%" height="100%" fill="${latar}"/>
  ${sel}
  <text x="50%" y="42%" font-family="sans-serif" font-size="34" fill="#ffffff" text-anchor="middle">DATA CONTOH (FIKTIF)</text>
  <text x="50%" y="52%" font-family="sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">${escapeXml(judul)}</text>
  <text x="50%" y="60%" font-family="sans-serif" font-size="22" fill="#ffffff" text-anchor="middle">${label}</text>
  <rect x="0" y="${TINGGI - 48}" width="100%" height="48" fill="#000000" fill-opacity="0.45"/>
  <text x="16" y="${TINGGI - 17}" font-family="sans-serif" font-size="20" fill="#ffffff">${escapeXml(teksWatermark(waktu))}</text>
</svg>`;

  const isi = await sharp(Buffer.from(svg)).png().toBuffer();
  return {
    isi,
    sha256: createHash("sha256").update(isi).digest("hex"),
    ukuranByte: isi.length,
  };
}

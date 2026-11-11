/**
 * Fungsi murni halaman validasi laporan Operator (I-07, FE-22): ID dan waktu pada kartu,
 * serta filter tab/urutan/halaman yang disimpan di query URL.
 */
import type { JenisLaporan } from "../types/api";
import { ROUTE } from "./nav";

export type UrutanLaporan = "terbaru" | "terlama";

export type FilterValidasi = {
  jenis: JenisLaporan;
  sort: UrutanLaporan;
  page: number;
};

// Kontrak FE-22: 6 laporan per halaman, sama dengan default `limit` GET /api/laporan.
export const LIMIT_VALIDASI = 6;

// Batas atas yang sama dengan validasi `page` di BE (BE-22).
const HALAMAN_MAKS = 1_000_000;

export const LABEL_JENIS: Record<JenisLaporan, string> = {
  REPORTIT: "ReportIt!",
  CLEANIT: "CleanIt!",
};

// Konvensi kontrak: ID laporan di UI ditulis "RPT-" + idLaporan minimal 4 digit.
export function formatIdLaporan(idLaporan: number): string {
  return `RPT-${String(idLaporan).padStart(4, "0")}`;
}

type BacaParam = { get(nama: string): string | null };

// Query bisa diketik pengguna; nilai yang tidak dikenal jatuh ke default ReportIt, terbaru, halaman 1.
export function bacaFilterValidasi(params: BacaParam): FilterValidasi {
  const page = params.get("page");
  const n = page && /^\d+$/.test(page) ? Number(page) : 1;
  return {
    jenis: params.get("jenis") === "cleanit" ? "CLEANIT" : "REPORTIT",
    sort: params.get("sort") === "terlama" ? "terlama" : "terbaru",
    page: n >= 1 && n <= HALAMAN_MAKS ? n : 1,
  };
}

// Nilai default tidak ditulis agar tampilan awal tetap beralamat /operator/laporan.
export function urlValidasi({ jenis, sort, page }: FilterValidasi): string {
  const query = new URLSearchParams();
  if (jenis === "CLEANIT") query.set("jenis", "cleanit");
  if (sort === "terlama") query.set("sort", "terlama");
  if (page > 1) query.set("page", String(page));
  const teks = query.toString();
  return teks ? `${ROUTE.operatorLaporan}?${teks}` : ROUTE.operatorLaporan;
}

const MENIT = 60 * 1000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

const FORMAT_TANGGAL_PENDEK = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

/**
 * Waktu pengiriman di kartu I-07, mis. "15 menit lalu"; lebih dari 7 hari ditulis tanggal WIB.
 * `sekarang` diberikan pemanggil agar hasilnya tetap sama selama satu kali render.
 */
export function formatWaktuKirim(iso: string, sekarang: number): string {
  // Jam server yang sedikit lebih cepat tidak boleh menghasilkan selisih negatif.
  const selisih = Math.max(0, sekarang - Date.parse(iso));
  if (selisih < MENIT) return "Baru saja";
  if (selisih < JAM) return `${Math.floor(selisih / MENIT)} menit lalu`;
  if (selisih < HARI) return `${Math.floor(selisih / JAM)} jam lalu`;
  if (selisih < 7 * HARI) return `${Math.floor(selisih / HARI)} hari lalu`;
  return FORMAT_TANGGAL_PENDEK.format(new Date(iso));
}

// Format lengkap seperti mockup I-08, mis. "14 Oktober 2023, 10.45 WIB".
export function formatWaktuLengkap(iso: string): string {
  const waktu = new Date(iso);
  return `${FORMAT_TANGGAL.format(waktu)}, ${FORMAT_JAM.format(waktu)} WIB`;
}

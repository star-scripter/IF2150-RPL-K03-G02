/**
 * Data dan logika halaman Beranda (FE-08, I-03) yang bisa diuji tanpa DOM.
 */
import { ROUTE } from "./nav";

/** Format angka poin gaya Indonesia, mis. 1250 → "1.250". */
export function formatPoin(poin: number): string {
  return poin.toLocaleString("id-ID");
}

export type MenuLaporan = {
  id: "reportit" | "cleanit";
  href: string;
  deskripsi: string;
  judul: string;
  /** Kelas latar kartu (token warna Figma). */
  latar: string;
  ikon: { src: string; width: number; height: number };
};

/**
 * Kartu "Buat Laporan" di Beranda. Sumber: "ReportIt Card" (64:291) dan "CleanIt Card" (64:312).
 * CleanIt selalu membuka daftar lokasi (I-09), karena form CleanIt butuh lokasi yang dipilih (N2).
 */
export const MENU_LAPORAN: readonly MenuLaporan[] = [
  {
    id: "reportit",
    href: ROUTE.reportit,
    deskripsi: "Nemu sampah di laut tapi mager?",
    judul: "ReportIt!",
    latar: "bg-sky-blue",
    ikon: { src: "/icons/reportit.svg", width: 35.0877, height: 40 },
  },
  {
    id: "cleanit",
    href: ROUTE.lokasi,
    deskripsi: "Abis beresin sampah di laut?",
    judul: "CleanIt!",
    latar: "bg-emerald",
    ikon: { src: "/icons/cleanit.svg", width: 32.25, height: 35.8333 },
  },
];

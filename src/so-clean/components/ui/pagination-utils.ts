/**
 * Perhitungan Pagination (FE-02), dipisah dari komponen agar bisa diuji tanpa DOM.
 * Input mengikuti `meta` kontrak: `{ page, limit, total }`.
 */
import type { PaginationMeta } from "../../types/api";

export type ItemHalaman = number | "elipsis";

export function jumlahHalaman({ limit, total }: Pick<PaginationMeta, "limit" | "total">): number {
  if (limit <= 0 || total <= 0) return 0;
  return Math.ceil(total / limit);
}

/** Rentang item yang sedang tampil, mis. `{ dari: 1, sampai: 6 }`; null jika kosong. */
export function rentangItem(meta: PaginationMeta): { dari: number; sampai: number } | null {
  if (meta.total <= 0 || meta.limit <= 0) return null;
  const dari = (meta.page - 1) * meta.limit + 1;
  if (dari > meta.total) return null;
  return { dari, sampai: Math.min(meta.page * meta.limit, meta.total) };
}

/**
 * Nomor halaman yang ditampilkan. Halaman pertama, terakhir, dan `tetangga` halaman di kiri
 * dan kanan halaman aktif selalu tampil; celah dua halaman atau lebih diganti "elipsis".
 * Contoh (10 halaman): aktif 5 → [1, "elipsis", 4, 5, 6, "elipsis", 10];
 * aktif 4 → [1, 2, 3, 4, 5, "elipsis", 10].
 */
export function daftarHalaman(aktif: number, total: number, tetangga = 1): ItemHalaman[] {
  if (total <= 0) return [];
  // Cukup sedikit: tampilkan semua (1 + elipsis + tetangga*2+1 + elipsis + 1).
  if (total <= 5 + tetangga * 2) return Array.from({ length: total }, (_, i) => i + 1);

  let kiri = Math.max(2, aktif - tetangga);
  let kanan = Math.min(total - 1, aktif + tetangga);
  // Elipsis yang hanya menggantikan satu nomor tidak menghemat tempat; tampilkan nomornya.
  if (kiri === 3) kiri = 2;
  if (kanan === total - 2) kanan = total - 1;
  const hasil: ItemHalaman[] = [1];
  if (kiri > 2) hasil.push("elipsis");
  for (let i = kiri; i <= kanan; i++) hasil.push(i);
  if (kanan < total - 1) hasil.push("elipsis");
  hasil.push(total);
  return hasil;
}

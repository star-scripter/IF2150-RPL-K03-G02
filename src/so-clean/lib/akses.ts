/**
 * Aturan akses halaman (FE-05): ke mana pengguna diarahkan berdasarkan route dan role sesi.
 *
 * Dipakai oleh `proxy.ts` (BE-06) untuk navigasi halaman. Ini hanya pengarahan tampilan;
 * hak akses data tetap diperiksa di setiap Route Handler API (401/403).
 *
 * Fungsi murni tanpa akses server agar bisa diuji dan dipakai bersama FE dan proxy.
 */
import type { Role } from "../types/api";
import { ROUTE } from "./nav";

/** Halaman yang bisa dibuka tanpa login. */
export const HALAMAN_PUBLIK: readonly string[] = [ROUTE.login, ROUTE.register];

/** Awalan route khusus Operator. */
const AWALAN_OPERATOR = "/operator";

/** Awalan route khusus Masyarakat (halaman dengan bottom nav dan form laporan). */
const AWALAN_MASYARAKAT: readonly string[] = [
  ROUTE.beranda,
  ROUTE.lokasi,
  ROUTE.hadiah,
  ROUTE.profil,
  ROUTE.reportit,
  "/cleanit",
];

/** Halaman awal tiap role: Operator → validasi laporan (I-07), Masyarakat → Beranda (I-03). */
export function halamanAwal(role: Role): string {
  return role === "OPERATOR" ? ROUTE.operatorLaporan : ROUTE.beranda;
}

/** true jika `pathname` sama dengan `awalan` atau route turunannya (mis. `/lokasi/12`). */
function cocokAwalan(pathname: string, awalan: string): boolean {
  return pathname === awalan || pathname.startsWith(`${awalan}/`);
}

export type KeputusanHalaman = { aksi: "lanjut" } | { aksi: "alihkan"; ke: string };

const LANJUT: KeputusanHalaman = { aksi: "lanjut" };

function alihkan(ke: string): KeputusanHalaman {
  return { aksi: "alihkan", ke };
}

/**
 * Tentukan apakah halaman `pathname` boleh dibuka oleh pengguna dengan `role`
 * (`null` = belum login / sesi tidak valid).
 *
 * - Tamu hanya boleh membuka halaman publik; selain itu ke Login.
 * - Pengguna yang sudah login tidak perlu membuka Login/Register; ke halaman awal role-nya.
 * - `/` diarahkan ke halaman awal role (atau Login untuk tamu).
 * - Halaman Operator hanya untuk Operator; halaman Masyarakat hanya untuk Masyarakat.
 * - Halaman lain (mis. `/design`) boleh dibuka siapa pun yang sudah login.
 */
export function aturanHalaman(pathname: string, role: Role | null): KeputusanHalaman {
  const publik = HALAMAN_PUBLIK.includes(pathname);

  if (!role) return publik ? LANJUT : alihkan(ROUTE.login);
  if (publik || pathname === "/") return alihkan(halamanAwal(role));

  if (cocokAwalan(pathname, AWALAN_OPERATOR)) {
    return role === "OPERATOR" ? LANJUT : alihkan(halamanAwal(role));
  }
  if (AWALAN_MASYARAKAT.some((awalan) => cocokAwalan(pathname, awalan))) {
    return role === "MASYARAKAT" ? LANJUT : alihkan(halamanAwal(role));
  }
  return LANJUT;
}

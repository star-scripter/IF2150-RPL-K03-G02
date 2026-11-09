/**
 * Route halaman dan daftar menu navigasi (FE-03).
 *
 * Satu-satunya tempat nama route dan menu didefinisikan; pakai `ROUTE.xxx` alih-alih menulis
 * path sendiri. Route turunan (mis. `/lokasi/12`) otomatis menandai menu induknya aktif.
 *
 * Kode ini hanya untuk view (tanpa akses server), tetapi diletakkan di `lib/` agar logikanya
 * bisa diuji di `tests/` tanpa DOM.
 */

/** Route halaman yang disepakati tim (FE-03). */
export const ROUTE = {
  // Halaman publik (FE-06, FE-07); sama dengan HALAMAN_PUBLIK di proxy BE-06.
  login: "/login",
  register: "/register",
  beranda: "/beranda",
  // Form ReportIt (FE-09), tanpa bottom nav; lihat app/(pages)/(masyarakat)/layout.tsx.
  reportit: "/reportit",
  lokasi: "/lokasi",
  hadiah: "/hadiah",
  profil: "/profil",
  operatorLaporan: "/operator/laporan",
  operatorProfil: "/operator/profil",
} as const;

export type IkonNav = {
  /** File di `public/icons/`, diunduh dari Figma. */
  src: string;
  /** Ukuran asli SVG dari Figma; jangan diubah agar proporsi ikon tetap benar. */
  width: number;
  height: number;
};

export type ItemNav = {
  href: string;
  label: string;
  ikon: IkonNav;
};

/** Bottom nav Masyarakat. Sumber: "Footer" (64:365) di Main Page Figma. */
export const NAV_MASYARAKAT: readonly ItemNav[] = [
  {
    href: ROUTE.beranda,
    label: "Home",
    ikon: { src: "/icons/nav-home.svg", width: 51.6619, height: 51.673 },
  },
  {
    href: ROUTE.lokasi,
    label: "Lokasi",
    ikon: { src: "/icons/nav-lokasi.svg", width: 54.0132, height: 54.0132 },
  },
  {
    href: ROUTE.hadiah,
    label: "Hadiah",
    ikon: { src: "/icons/nav-hadiah.svg", width: 52, height: 52 },
  },
  {
    href: ROUTE.profil,
    label: "Profil",
    ikon: { src: "/icons/nav-profil.svg", width: 39.75, height: 39.75 },
  },
];

/** Nav header Operator. Sumber: "Navigasi" (62:293) di Validator laporan Figma. */
export const NAV_OPERATOR: readonly ItemNav[] = [
  {
    href: ROUTE.operatorLaporan,
    label: "Laporan",
    ikon: { src: "/icons/laporan.svg", width: 20, height: 20 },
  },
];

/**
 * true jika `pathname` adalah `href` itu sendiri atau route turunannya.
 * Contoh: `/lokasi` dan `/lokasi/12` → aktif untuk `/lokasi`; `/lokasiku` → tidak.
 */
export function isNavAktif(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  const bersih = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return bersih === href || bersih.startsWith(`${href}/`);
}

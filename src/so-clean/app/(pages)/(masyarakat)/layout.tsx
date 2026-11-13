/**
 * Layout semua halaman Masyarakat (FE-03): header SoClean selebar layar dan kolom selebar HP
 * (440px) di tengah layar; di luar kolom diberi latar `surface`. Mulai `md` kolom melebar ke
 * kontainer desktop 1080px seperti layout form laporan (FE-09/FE-17) dan halaman Operator, dan
 * menu pindah dari bottom nav ke header.
 *
 * Halaman dengan bottom nav diletakkan di bawah route group `(nav)/`; Penukaran Berhasil
 * (`/hadiah/berhasil`) di luar group itu sehingga di HP tanpa bottom nav.
 *
 * `NavHeaderMasyarakatAktif` memakai `usePathname()`, jadi dibungkus `Suspense` seperti
 * `BottomNavAktif` (lihat `(nav)/layout.tsx`).
 *
 * Elemen `<main>` dibuat oleh tiap halaman, bukan layout.
 */
import { Suspense, type ReactNode } from "react";
import { HeaderMasyarakat } from "@/components/HeaderMasyarakat";
import { NavHeaderMasyarakat } from "@/components/NavHeaderMasyarakat";
import { NavHeaderMasyarakatAktif } from "@/components/NavHeaderMasyarakatAktif";

export default function LayoutMasyarakat({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      <HeaderMasyarakat
        nav={
          <Suspense fallback={<NavHeaderMasyarakat pathname={null} />}>
            <NavHeaderMasyarakatAktif />
          </Suspense>
        }
      />
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col bg-white md:max-w-[1080px] md:bg-transparent md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}

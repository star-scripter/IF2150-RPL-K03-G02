/**
 * Layout halaman Masyarakat yang memakai bottom nav (FE-03): Beranda, Lokasi, Hadiah, Profil,
 * dan route turunannya (mis. `/lokasi/[idLokasi]`, `/hadiah/riwayat`).
 *
 * Konten diberi ruang bawah setinggi bottom nav (124px + area aman HP), jadi halaman tidak
 * perlu menambah `pb-*` sendiri. Mulai `md` bottom nav disembunyikan (menu pindah ke header),
 * jadi ruang bawah itu dilepas.
 *
 * `BottomNavAktif` memakai `usePathname()`. Dengan `cacheComponents`, hook itu menunda render
 * pada route berparam dinamis, jadi dibungkus `Suspense`; fallback-nya bottom nav tanpa item
 * aktif agar tata letak tidak bergeser.
 */
import { Suspense, type ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { BottomNavAktif } from "@/components/BottomNavAktif";

export default function LayoutDenganNav({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col pb-[calc(124px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <Suspense fallback={<BottomNav pathname={null} />}>
        <BottomNavAktif />
      </Suspense>
    </>
  );
}

/**
 * Layout semua halaman Masyarakat (FE-03): header SoClean dan kolom selebar HP (440px) di
 * tengah layar; di luar kolom diberi latar `surface`.
 *
 * Tanpa bottom nav, jadi dipakai langsung oleh form multi-step (ReportIt `/reportit`, CleanIt
 * `/cleanit/[idLokasi]`) yang di Figma tidak punya bottom nav. Halaman dengan bottom nav
 * diletakkan di bawah route group `(nav)/`.
 *
 * Elemen `<main>` dibuat oleh tiap halaman, bukan layout.
 */
import type { ReactNode } from "react";
import { HeaderMasyarakat } from "@/components/HeaderMasyarakat";

export default function LayoutMasyarakat({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-surface">
      <div className="flex w-full max-w-[440px] flex-col bg-white">
        <HeaderMasyarakat />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

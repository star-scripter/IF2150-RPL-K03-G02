/**
 * Header halaman Masyarakat (FE-03). Sumber: komponen Figma "Header" (41:56).
 * Logo mengarah ke Beranda. `nav` diisi layout Masyarakat dengan menu desktop
 * (`NavHeaderMasyarakat`); layout form laporan tidak mengisinya.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTE } from "@/lib/nav";
import { Logo } from "./Logo";

export function HeaderMasyarakat({ nav }: { nav?: ReactNode }) {
  return (
    <header className="bg-dark-teal px-4 py-3.5 min-[400px]:px-8">
      <div className="flex items-center justify-between gap-6">
        <Link
          href={ROUTE.beranda}
          aria-label="SoClean, ke Beranda"
          className="inline-flex h-[68px] items-center rounded-button focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Logo />
        </Link>
        {nav}
      </div>
    </header>
  );
}

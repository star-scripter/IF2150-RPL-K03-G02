/**
 * Header halaman Masyarakat (FE-03). Sumber: komponen Figma "Header" (41:56).
 * Logo mengarah ke Beranda.
 */
import Link from "next/link";
import { ROUTE } from "@/lib/nav";
import { Logo } from "./Logo";

export function HeaderMasyarakat() {
  return (
    <header className="bg-dark-teal px-4 py-3.5 min-[400px]:px-8">
      <Link
        href={ROUTE.beranda}
        aria-label="SoClean, ke Beranda"
        className="inline-flex h-[68px] items-center rounded-button focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <Logo />
      </Link>
    </header>
  );
}

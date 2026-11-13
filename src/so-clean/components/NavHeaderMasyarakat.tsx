/**
 * Menu Masyarakat di header untuk layar desktop (≥ md); di HP menu yang sama tampil sebagai
 * `BottomNav`. Seperti `BottomNav`, komponen ini hanya tampilan dan menerima `pathname`; versi
 * yang membaca route ada di `NavHeaderMasyarakatAktif.tsx`.
 */
import Link from "next/link";
import { NAV_MASYARAKAT, isNavAktif } from "@/lib/nav";
import { cn } from "./ui/cn";

export function NavHeaderMasyarakat({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Navigasi utama" className="hidden md:block">
      <ul className="flex items-center gap-2">
        {NAV_MASYARAKAT.map((item) => {
          const aktif = isNavAktif(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-button px-5 py-3 font-semibold",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  aktif ? "bg-emerald text-dark-teal" : "text-white hover:bg-white/10",
                )}
              >
                <span aria-hidden className="flex size-7 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
                  <img
                    src={item.ikon.src}
                    alt=""
                    // Ukuran Figma bottom nav diperkecil setengah agar proporsi antarikon tetap.
                    width={item.ikon.width / 2}
                    height={item.ikon.height / 2}
                    // Ikon Figma berwarna dark teal; di latar gelap (tidak aktif) dijadikan putih.
                    className={aktif ? undefined : "brightness-0 invert"}
                  />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

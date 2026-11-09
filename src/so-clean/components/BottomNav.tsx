/**
 * Bottom nav Masyarakat (FE-03). Sumber: "Footer" (64:365) di Main Page Figma.
 *
 * Dipisah menjadi dua komponen karena Next.js 16 dengan `cacheComponents`:
 * - `BottomNav` (file ini): tampilan saja, menerima `pathname`. Bisa dirender di server,
 *   dipakai sebagai fallback `Suspense` (tanpa item aktif).
 * - `BottomNavAktif`: client component yang membaca route lewat `usePathname()`. Pada route
 *   dengan param dinamis (mis. `/lokasi/[idLokasi]`), `usePathname` menunda render saat
 *   prerender, jadi harus dibungkus `Suspense` (lihat `app/(pages)/(masyarakat)/(nav)/layout.tsx`).
 */
import Link from "next/link";
import { NAV_MASYARAKAT, isNavAktif } from "@/lib/nav";
import { cn } from "./ui/cn";

/**
 * Tinggi bottom nav 124px (sesuai Figma) + area aman bawah HP. Jika tinggi ini berubah, ubah
 * juga ruang bawah konten di `app/(pages)/(masyarakat)/(nav)/layout.tsx`.
 */
export function BottomNav({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] border-t border-border bg-white",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="flex gap-2.5 px-4 py-3.5 min-[400px]:px-8">
        {NAV_MASYARAKAT.map((item) => {
          const aktif = isNavAktif(pathname, item.href);
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-2.5 rounded-button p-[5px]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal",
                  aktif ? "bg-emerald text-white" : "text-dark-teal hover:bg-surface",
                )}
              >
                <span aria-hidden className="flex size-[52px] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
                  <img src={item.ikon.src} alt="" width={item.ikon.width} height={item.ikon.height} />
                </span>
                <span className="text-body">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

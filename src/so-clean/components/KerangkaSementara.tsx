/**
 * Header dan bottom nav sementara untuk halaman Masyarakat selama layout FE-03 belum tersedia.
 * Logo dan ikon masih berupa placeholder bentuk; warna memakai warna dasar Tailwind.
 *
 * TODO(FE-03): hapus file ini dan pemakaiannya setelah layout FE-03 di-merge.
 */
import Link from "next/link";
import type { ReactNode } from "react";

type Menu = "home" | "lokasi" | "hadiah" | "profil";

type Props = {
  aktif: Menu;
  children: ReactNode;
};

const DAFTAR_MENU: { kunci: Menu; label: string; href: string }[] = [
  { kunci: "home", label: "Home", href: "/" },
  { kunci: "lokasi", label: "Lokasi", href: "/lokasi" },
  { kunci: "hadiah", label: "Hadiah", href: "/hadiah" },
  { kunci: "profil", label: "Profil", href: "/profil" },
];

export default function KerangkaSementara({ aktif, children }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-emerald-950 text-white">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
          <span aria-hidden="true" className="size-7 rounded-full bg-sky-300" />
          <span className="text-lg font-bold">SoClean</span>
        </div>
      </header>

      {/* pb-20 memberi ruang agar konten terbawah tidak tertutup bottom nav yang fixed. */}
      <div className="flex flex-1 flex-col pb-20">{children}</div>

      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white">
        <ul className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 px-4 py-2">
          {DAFTAR_MENU.map((menu) => {
            const sedangAktif = menu.kunci === aktif;
            return (
              <li key={menu.kunci}>
                <Link
                  href={menu.href}
                  aria-current={sedangAktif ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${
                    sedangAktif ? "bg-emerald-500 text-white" : "text-emerald-950"
                  }`}
                >
                  <span aria-hidden="true" className="size-6 rounded-md border-2 border-current" />
                  {menu.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

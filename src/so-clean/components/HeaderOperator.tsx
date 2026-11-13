/**
 * Header halaman Operator (FE-03). Sumber: "Menu utama" (62:287) di Validator laporan Figma.
 *
 * Isi: logo, nav Laporan (state aktif), lencana "Operator", dan avatar yang menuju Profil.
 * Seperti `BottomNav`, komponen ini hanya tampilan dan menerima `pathname`; versi yang membaca
 * route ada di `HeaderOperatorAktif.tsx` (dibungkus `Suspense` di layout Operator).
 *
 * Avatar memakai inisial `namaOperator` (dari `GET /api/me` di `HeaderOperatorAktif`, FE-24);
 * selama belum dimuat atau jika gagal, inisial bawaan "O".
 */
import Link from "next/link";
import { NAV_OPERATOR, ROUTE, isNavAktif } from "@/lib/nav";
import { Logo } from "./Logo";
import { cn } from "./ui/cn";

type Props = {
  pathname: string | null;
  namaOperator?: string;
};

const FOKUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function HeaderOperator({ pathname, namaOperator = "Operator" }: Props) {
  const inisial = namaOperator.trim().charAt(0).toUpperCase() || "O";
  const profilAktif = isNavAktif(pathname, ROUTE.operatorProfil);

  return (
    <header className="bg-dark-teal">
      <div className="mx-auto flex h-24 w-full items-center justify-between gap-3 px-4 sm:px-8 lg:pr-10">
        <Link
          href={ROUTE.operatorLaporan}
          aria-label="SoClean, ke halaman Laporan"
          className={cn("inline-flex items-center rounded-button", FOKUS)}
        >
          <Logo ukuran="sedang" teksDisembunyikanDiHp />
        </Link>

        <nav aria-label="Navigasi Operator">
          <ul className="flex items-center gap-2">
            {NAV_OPERATOR.map((item) => {
              const aktif = isNavAktif(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={aktif ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-button px-4 py-3.5 font-semibold sm:px-6",
                      FOKUS,
                      aktif ? "bg-emerald text-dark-teal" : "text-white hover:bg-white/10",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
                    <img
                      src={item.ikon.src}
                      alt=""
                      width={item.ikon.width}
                      height={item.ikon.height}
                      // Ikon Figma berwarna dark teal; di latar gelap (tidak aktif) dijadikan putih.
                      className={aktif ? undefined : "brightness-0 invert"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3.5">
          <span className="hidden items-center gap-2 rounded-full bg-light-green px-4 py-2.5 text-[15px] font-semibold text-dark-teal sm:inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
            <img src="/icons/check.svg" alt="" width={17} height={17} />
            Operator
          </span>
          <Link
            href={ROUTE.operatorProfil}
            aria-label="Profil Operator"
            aria-current={profilAktif ? "page" : undefined}
            className={cn(
              "flex size-11 items-center justify-center rounded-full bg-sky-blue text-[17px] font-semibold text-navy",
              FOKUS,
              profilAktif && "ring-2 ring-emerald ring-offset-2 ring-offset-dark-teal",
            )}
          >
            <span aria-hidden>{inisial}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

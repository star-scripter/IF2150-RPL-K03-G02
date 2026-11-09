/**
 * Logo SoClean (FE-03). Sumber: "Logo" (89:428) dan "CleanIt Vector" (12:33) di Figma.
 *
 * Ukuran:
 * - `besar` : header Masyarakat (teks 32px), juga cocok untuk Login/Register.
 * - `sedang`: header Operator (teks 26px).
 *
 * `teksDisembunyikanDiHp` menyembunyikan tulisan "SoClean" di layar sempit (< 640px), mis. di
 * header Operator yang penuh saat dibuka di HP.
 */
import { cn } from "./ui/cn";

type Props = {
  ukuran?: "besar" | "sedang";
  teksDisembunyikanDiHp?: boolean;
  className?: string;
};

export function Logo({ ukuran = "besar", teksDisembunyikanDiHp = false, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-white", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis dari Figma */}
      <img src="/logo-soclean.svg" alt="" width={44} height={55.0116} className="shrink-0" />
      <span
        className={cn(
          "font-heading font-bold leading-10",
          ukuran === "besar" ? "text-[32px]" : "text-[26px]",
          teksDisembunyikanDiHp && "sr-only sm:not-sr-only",
        )}
      >
        SoClean
      </span>
    </span>
  );
}

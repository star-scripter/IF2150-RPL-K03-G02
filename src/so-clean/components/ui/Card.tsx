/**
 * Card (FE-02). Sumber: komponen Figma "General Card" (47:278) dan "Lokasi Card" (102:214).
 *
 * Varian:
 * - `gelap`  : latar dark teal, teks putih, mis. kartu "Poin Anda" di Beranda/Hadiah.
 * - `garis`  : latar putih dengan border, mis. kartu lokasi, reward, dan laporan.
 * - `lembut` : latar surface tanpa border, mis. kotak info di Detail Laporan.
 *
 * `onClick` menjadikan kartu bisa diklik (mis. kartu laporan I-07 membuka I-08, N10): kartu
 * dirender sebagai `<button>` agar bisa difokus dan ditekan dengan keyboard.
 *
 * Contoh:
 *   <Card varian="gelap"><h2 className="text-h2">Poin Anda</h2></Card>
 *   <Card onClick={() => buka(id)}>...</Card>
 */
import type { HTMLAttributes, MouseEventHandler } from "react";
import { cn } from "./cn";

export type VarianCard = "gelap" | "garis" | "lembut";

type Props = Omit<HTMLAttributes<HTMLElement>, "onClick"> & {
  varian?: VarianCard;
  /** Tandai kartu sebagai terpilih (border emerald), mis. kartu yang sedang dibuka. */
  terpilih?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const KELAS_VARIAN: Record<VarianCard, string> = {
  gelap: "bg-dark-teal text-white px-9 py-[26px]",
  garis: "border border-border bg-white p-5",
  lembut: "border border-border bg-surface p-4",
};

export function Card({ varian = "garis", terpilih = false, onClick, className, ...props }: Props) {
  const kelas = cn(
    "flex flex-col gap-3.5 rounded-card text-left",
    // Kelas terpilih menggantikan border/latar varian (bukan ditumpuk) agar tidak bentrok.
    terpilih ? "border-2 border-emerald bg-emerald/10 p-5 text-ink" : KELAS_VARIAN[varian],
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          kelas,
          "w-full cursor-pointer transition hover:border-emerald",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal",
        )}
        {...props}
      />
    );
  }

  return <div className={kelas} {...props} />;
}

/**
 * Card (FE-02). Sumber: komponen Figma "General Card" (47:278) dan "Lokasi Card" (102:214).
 *
 * Varian:
 * - `gelap`  : latar dark teal, teks putih, mis. kartu "Poin Anda" di Beranda/Hadiah.
 * - `garis`  : latar putih dengan border, mis. kartu lokasi, reward, dan laporan.
 * - `lembut` : latar surface tanpa border, mis. kotak info di Detail Laporan.
 *
 * Kartu yang bisa diklik (mis. kartu laporan I-07 membuka I-08, N10): isi `onClick` dan
 * `labelAksi`. Kartu tetap `<div>`; sebuah `<button>` transparan menutupi seluruh kartu
 * ("stretched button"), jadi seluruh kartu bisa diklik dan difokus keyboard tanpa membuat
 * tombol di dalam tombol. Tombol atau tautan lain di dalam kartu harus diberi kelas
 * `relative z-10` agar berada di atas tombol penutup dan tetap bisa diklik sendiri.
 *
 * Contoh:
 *   <Card varian="gelap"><h2 className="text-h2">Poin Anda</h2></Card>
 *   <Card onClick={() => buka(id)} labelAksi="Buka laporan RPT-0248">...</Card>
 */
import type { HTMLAttributes, MouseEventHandler } from "react";
import { cn } from "./cn";

export type VarianCard = "gelap" | "garis" | "lembut";

type PropsDasar = Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
  varian?: VarianCard;
  /** Tandai kartu sebagai terpilih (border emerald), mis. kartu yang sedang dibuka. */
  terpilih?: boolean;
};

type Props = PropsDasar &
  (
    | { onClick?: undefined; labelAksi?: undefined }
    | {
        onClick: MouseEventHandler<HTMLButtonElement>;
        /** Nama aksi untuk pembaca layar, mis. "Buka laporan RPT-0248". */
        labelAksi: string;
      }
  );

const KELAS_VARIAN: Record<VarianCard, string> = {
  gelap: "bg-dark-teal text-white px-9 py-[26px]",
  garis: "border border-border bg-white p-5",
  lembut: "border border-border bg-surface p-4",
};

export function Card({
  varian = "garis",
  terpilih = false,
  onClick,
  labelAksi,
  className,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-card text-left",
        // Kelas terpilih menggantikan border/latar varian (bukan ditumpuk) agar tidak bentrok.
        terpilih ? "border-2 border-emerald bg-emerald/10 p-5 text-ink" : KELAS_VARIAN[varian],
        onClick && "relative transition hover:border-emerald",
        className,
      )}
      {...props}
    >
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          aria-label={labelAksi}
          className={cn(
            "absolute inset-0 cursor-pointer rounded-card",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal",
          )}
        />
      )}
      {children}
    </div>
  );
}

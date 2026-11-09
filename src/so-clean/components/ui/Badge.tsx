/**
 * Badge (FE-02). Sumber: "Badge Poin" di "Lokasi Card" (102:218), "Status antrean" (62:321),
 * dan "Lencana operator" (62:301) di Validator laporan.
 *
 * Varian:
 * - `poin`       : dark teal + light green, mis. "+50 poin", jumlah di tab (I-07, I-09).
 * - `peringatan` : kuning, mis. "12 menunggu validasi", status BELUM_DIPERIKSA.
 * - `sukses`     : light green, mis. "Operator", status VALID / DIBERSIHKAN.
 * - `bahaya`     : merah muda, mis. status TIDAK_VALID / TERCEMAR, "Habis".
 * - `netral`     : abu-abu bergaris, mis. "Pelapor = Relawan".
 *
 * `titik` menampilkan bulatan kecil di depan teks (seperti indikator menunggu di Figma).
 *
 * Contoh:
 *   <Badge>+50 poin</Badge>
 *   <Badge varian="peringatan" titik>12 menunggu validasi</Badge>
 */
import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type VarianBadge = "poin" | "peringatan" | "sukses" | "bahaya" | "netral";

type Props = HTMLAttributes<HTMLSpanElement> & {
  varian?: VarianBadge;
  titik?: boolean;
};

const KELAS_VARIAN: Record<VarianBadge, { badge: string; titik: string }> = {
  poin: { badge: "bg-dark-teal text-light-green font-heading font-bold", titik: "bg-light-green" },
  peringatan: { badge: "bg-warning-bg text-warning-text font-medium", titik: "bg-yellow" },
  sukses: { badge: "bg-light-green text-dark-teal font-semibold", titik: "bg-dark-teal" },
  bahaya: { badge: "bg-danger-bg text-danger-text font-semibold", titik: "bg-danger" },
  netral: { badge: "border border-border bg-white text-text-secondary font-medium", titik: "bg-text-secondary" },
};

export function Badge({ varian = "poin", titik = false, className, children, ...props }: Props) {
  const gaya = KELAS_VARIAN[varian];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm leading-5",
        gaya.badge,
        className,
      )}
      {...props}
    >
      {titik && <span aria-hidden className={cn("size-[7px] rounded-full", gaya.titik)} />}
      {children}
    </span>
  );
}

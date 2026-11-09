/**
 * Button (FE-02). Sumber: komponen Figma "Button" (24:98) dan tombol di "Dialog" (97:582),
 * "Detail Laporan" (Setujui/Tolak).
 *
 * Varian:
 * - `primer`   : aksi utama (emerald), mis. Masuk, Tukarkan, Setujui.
 * - `sekunder` : aksi pendamping (outline dark teal), mis. Batal, Kembali ke Hadiah.
 * - `bahaya`   : aksi menolak/menghapus, mis. Tolak.
 * - `teks`     : tautan bergaris bawah, mis. Batalkan, Daftar.
 *
 * `memuat` menonaktifkan tombol dan menampilkan spinner; pakai untuk mencegah klik ganda
 * saat request berjalan (FE-19, FE-23).
 *
 * Contoh:
 *   <Button onClick={kirim} memuat={sedangKirim} lebarPenuh>Tukarkan</Button>
 *   <Button varian="sekunder" onClick={tutup}>Batal</Button>
 */
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type VarianButton = "primer" | "sekunder" | "bahaya" | "teks";
export type UkuranButton = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  varian?: VarianButton;
  /** `lg` = Button Figma (64px, Heading 3); `md` = tombol dialog/kartu (48px, 16px). */
  ukuran?: UkuranButton;
  lebarPenuh?: boolean;
  memuat?: boolean;
};

const KELAS_VARIAN: Record<VarianButton, string> = {
  primer: "bg-emerald text-ink hover:brightness-95 active:brightness-90",
  sekunder: "border border-dark-teal bg-white text-dark-teal hover:bg-surface active:bg-border",
  bahaya: "bg-danger text-ink hover:brightness-95 active:brightness-90",
  teks: "bg-transparent text-dark-teal underline underline-offset-2 hover:text-emerald",
};

const KELAS_UKURAN: Record<UkuranButton, string> = {
  md: "min-h-12 px-6 py-3 text-body",
  lg: "min-h-16 px-9 py-[18px] text-h3",
};

export function Button({
  varian = "primer",
  ukuran = "md",
  lebarPenuh = false,
  memuat = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: Props) {
  const nonaktif = disabled || memuat;
  return (
    <button
      type={type}
      disabled={nonaktif}
      aria-busy={memuat || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-heading font-semibold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
        varian === "teks" ? "p-0 text-body" : cn("rounded-button", KELAS_UKURAN[ukuran]),
        KELAS_VARIAN[varian],
        lebarPenuh && "w-full",
        className,
      )}
      {...props}
    >
      {memuat && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

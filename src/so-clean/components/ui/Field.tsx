/**
 * Kerangka isian bersama untuk Textbox dan Dropdown (FE-02): label, isi, petunjuk, dan pesan
 * error. Sumber: komponen Figma "Login Field" (24:50) dan "Field · Sumber Laporan" (108:305).
 *
 * Ukuran label:
 * - `besar`   : Heading 3 dark teal, seperti form Login/Register (I-01, I-02).
 * - `ringkas` : 12px semibold, seperti form laporan (I-11).
 */
import type { ReactNode } from "react";
import { cn } from "./cn";

export type UkuranLabel = "besar" | "ringkas";

export type PropsField = {
  label: string;
  /** Konten di kanan label, mis. tautan atau penghitung karakter "12/80". */
  labelKanan?: ReactNode;
  /** Pesan error untuk isian ini, mis. dari `ApiError.fields[nama]`. */
  error?: string;
  /** Teks bantuan di bawah isian; disembunyikan saat ada error. */
  petunjuk?: string;
  wajib?: boolean;
  ukuranLabel?: UkuranLabel;
};

/** Kelas kotak isian bersama (border, radius, padding, fokus, error). */
export function kelasKotakIsian(adaError: boolean): string {
  return cn(
    "w-full rounded-button border bg-white px-4 py-[11px] text-body text-ink",
    "placeholder:text-text-secondary",
    "focus:outline-2 focus:outline-offset-0",
    "disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-secondary",
    adaError ? "border-danger focus:outline-danger" : "border-border focus:outline-dark-teal",
  );
}

type PropsKerangka = PropsField & {
  idIsian: string;
  idPesan: string;
  children: ReactNode;
};

export function KerangkaField({
  label,
  labelKanan,
  error,
  petunjuk,
  wajib,
  ukuranLabel = "besar",
  idIsian,
  idPesan,
  children,
}: PropsKerangka) {
  const pesan = error ?? petunjuk;
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2.5">
        <label
          htmlFor={idIsian}
          className={cn(
            ukuranLabel === "besar"
              ? "text-h3 font-heading text-dark-teal"
              : "text-xs font-semibold leading-[1.35] text-ink",
          )}
        >
          {label}
          {wajib && <span aria-hidden> *</span>}
        </label>
        {labelKanan && <div className="text-sm text-dark-teal">{labelKanan}</div>}
      </div>
      {children}
      {pesan && (
        <p
          id={idPesan}
          role={error ? "alert" : undefined}
          className={cn("text-sm", error ? "text-danger-text" : "text-text-secondary")}
        >
          {pesan}
        </p>
      )}
    </div>
  );
}

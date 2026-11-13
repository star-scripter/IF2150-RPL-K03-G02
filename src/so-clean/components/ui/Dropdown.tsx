/**
 * Dropdown (FE-02). Sumber: "Field · Sumber Laporan" (108:305) di Form Laporan.
 *
 * Memakai `<select>` bawaan agar aksesibel dan memakai pemilih bawaan HP. Tampilannya
 * disamakan dengan Textbox; panah "▾" mengikuti desain Figma.
 *
 * Contoh (dropdown poin K3, default 50):
 *   <Dropdown label="Poin" value={poin} onChange={(e) => setPoin(Number(e.target.value))}
 *             pilihan={[{ nilai: 50, label: "50 poin" }, { nilai: 100, label: "100 poin" },
 *                       { nilai: 200, label: "200 poin" }]} />
 */
"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "./cn";
import { KerangkaField, kelasKotakIsian, type PropsField } from "./Field";

export type PilihanDropdown = {
  nilai: string | number;
  label: string;
  nonaktif?: boolean;
};

type Props = PropsField &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "required" | "children"> & {
    pilihan: readonly PilihanDropdown[];
    /** Opsi kosong di awal, mis. "Pilih sumber laporan". Tidak bisa dipilih ulang. */
    placeholder?: string;
  };

export function Dropdown({
  label,
  labelKanan,
  error,
  petunjuk,
  wajib,
  ukuranLabel,
  id,
  className,
  pilihan,
  placeholder,
  value,
  defaultValue,
  ...props
}: Props) {
  const idOtomatis = useId();
  const idIsian = id ?? idOtomatis;
  const idPesan = `${idIsian}-pesan`;
  // Tanpa value/defaultValue, placeholder (jika ada) menjadi pilihan awal.
  const nilaiAwal = value === undefined && defaultValue === undefined && placeholder ? "" : defaultValue;

  return (
    <KerangkaField
      {...{ label, labelKanan, error, petunjuk, wajib, ukuranLabel, idIsian, idPesan }}
    >
      <div className="relative w-full">
        <select
          id={idIsian}
          required={wajib}
          value={value}
          defaultValue={nilaiAwal}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || petunjuk ? idPesan : undefined}
          className={cn(kelasKotakIsian(Boolean(error)), "appearance-none pr-10", className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {pilihan.map((p) => (
            <option key={p.nilai} value={p.nilai} disabled={p.nonaktif}>
              {p.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-text-secondary"
        >
          ▾
        </span>
      </div>
    </KerangkaField>
  );
}

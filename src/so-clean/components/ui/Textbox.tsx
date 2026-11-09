/**
 * Textbox dan Textarea (FE-02). Sumber: komponen Figma "Login Field" (24:50).
 *
 * Semua atribut `<input>` biasa (type, value, onChange, placeholder, maxLength, ...) diteruskan.
 * `error` mewarnai border, menampilkan pesan, dan mengisi `aria-invalid`/`aria-describedby`.
 *
 * Contoh:
 *   <Textbox label="Email" type="email" value={email} onChange={...}
 *            error={galat?.fields?.email} />
 *   <Textarea label="Alasan penolakan" wajib ukuranLabel="ringkas" rows={3} />
 */
"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { KerangkaField, kelasKotakIsian, type PropsField } from "./Field";

type PropsTextbox = PropsField & Omit<InputHTMLAttributes<HTMLInputElement>, "required">;

export function Textbox({
  label,
  labelKanan,
  error,
  petunjuk,
  wajib,
  ukuranLabel,
  id,
  className,
  ...props
}: PropsTextbox) {
  const idOtomatis = useId();
  const idIsian = id ?? idOtomatis;
  const idPesan = `${idIsian}-pesan`;
  return (
    <KerangkaField
      {...{ label, labelKanan, error, petunjuk, wajib, ukuranLabel, idIsian, idPesan }}
    >
      <input
        id={idIsian}
        required={wajib}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || petunjuk ? idPesan : undefined}
        className={cn(kelasKotakIsian(Boolean(error)), className)}
        {...props}
      />
    </KerangkaField>
  );
}

type PropsTextarea = PropsField & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "required">;

export function Textarea({
  label,
  labelKanan,
  error,
  petunjuk,
  wajib,
  ukuranLabel,
  id,
  className,
  rows = 3,
  ...props
}: PropsTextarea) {
  const idOtomatis = useId();
  const idIsian = id ?? idOtomatis;
  const idPesan = `${idIsian}-pesan`;
  return (
    <KerangkaField
      {...{ label, labelKanan, error, petunjuk, wajib, ukuranLabel, idIsian, idPesan }}
    >
      <textarea
        id={idIsian}
        rows={rows}
        required={wajib}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || petunjuk ? idPesan : undefined}
        className={cn(kelasKotakIsian(Boolean(error)), "resize-y", className)}
        {...props}
      />
    </KerangkaField>
  );
}

/**
 * Logika form Login (FE-06, I-01) yang bisa diuji tanpa DOM: validasi sisi klien dan
 * pemetaan error API ke pesan form.
 *
 * Validasi klien hanya mencegah request yang pasti gagal (isian kosong, email tanpa format).
 * Aturan akun lengkap (N7) tetap diperiksa server; login gagal selalu satu pesan generik.
 */
import type { Role } from "../types/api";
import { ApiError } from "./api/client";
import { PESAN_ERROR } from "./api/pesan-error";
import { ROUTE } from "./nav";

/** Halaman tujuan setelah login: Operator → validasi laporan (I-07), Masyarakat → Beranda (I-03). */
export function tujuanSetelahLogin(role: Role): string {
  return role === "OPERATOR" ? ROUTE.operatorLaporan : ROUTE.beranda;
}

export type IsianLogin = {
  email: string;
  password: string;
};

export type GalatLogin = {
  /** Pesan untuk seluruh form, mis. `LOGIN_GAGAL` atau gangguan jaringan. */
  umum?: string;
  /** Pesan per field. */
  fields: Partial<Record<keyof IsianLogin, string>>;
};

/** Format email minimal untuk validasi klien (dipakai juga oleh form Register). */
export const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalisasi email seperti server (N7): trim dan huruf kecil. */
export function normalisasiEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Validasi sisi klien; `null` jika isian boleh dikirim. */
export function validasiLogin(isian: IsianLogin): GalatLogin | null {
  const fields: GalatLogin["fields"] = {};
  const email = normalisasiEmail(isian.email);

  if (!email) fields.email = "Email wajib diisi.";
  else if (!POLA_EMAIL.test(email)) fields.email = "Format email tidak valid.";

  // Password tidak di-trim: spasi bisa menjadi bagian password.
  if (!isian.password) fields.password = "Password wajib diisi.";

  return Object.keys(fields).length > 0 ? { fields } : null;
}

/** Ubah error dari `authApi.login` menjadi pesan yang ditampilkan di form. */
export function galatDariError(error: unknown): GalatLogin {
  if (!(error instanceof ApiError)) {
    return { umum: PESAN_ERROR.INTERNAL_ERROR, fields: {} };
  }

  if (error.code === "FORMAT_TIDAK_VALID" && error.fields) {
    const fields: GalatLogin["fields"] = {};
    if (error.fields.email) fields.email = error.fields.email;
    if (error.fields.password) fields.password = error.fields.password;
    // Field lain di luar form ditampilkan sebagai pesan umum agar tidak hilang.
    return Object.keys(fields).length > 0 ? { fields } : { umum: error.message, fields: {} };
  }

  // LOGIN_GAGAL, JARINGAN, INTERNAL_ERROR, dll.: pesan Indonesia dari FE-04.
  return { umum: error.message, fields: {} };
}

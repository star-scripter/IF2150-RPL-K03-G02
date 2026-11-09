/**
 * Logika form Register (FE-07, I-02) yang bisa diuji tanpa DOM: validasi sisi klien sesuai
 * Aturan akun (N7) dan pemetaan error API ke pesan form.
 *
 * Aturan dan pesannya sama dengan `server/auth/account.ts` (BE-05). View tidak boleh mengimpor
 * dari `server/`, jadi aturan disalin di sini; jika aturan akun di kontrak berubah, ubah keduanya.
 * Server tetap memvalidasi ulang.
 */
import { ApiError } from "./api/client";
import { PESAN_ERROR } from "./api/pesan-error";

export type IsianRegister = {
  nama: string;
  email: string;
  password: string;
};

export type GalatRegister = {
  /** Pesan untuk seluruh form, mis. gangguan jaringan. */
  umum?: string;
  /** Pesan per field. */
  fields: Partial<Record<keyof IsianRegister, string>>;
};

export const MAKS_NAMA = 100;
export const MAKS_EMAIL = 255;
export const MIN_PASSWORD = 8;
export const MAKS_PASSWORD = 72;

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalisasi email seperti server (N7): trim dan huruf kecil. */
export function normalisasiEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Normalisasi nama seperti server: trim. */
export function normalisasiNama(nama: string): string {
  return nama.trim();
}

/** Isian yang dikirim ke `POST /api/auth/register`. */
export function bodyRegister(isian: IsianRegister): IsianRegister {
  return {
    nama: normalisasiNama(isian.nama),
    email: normalisasiEmail(isian.email),
    // Password tidak di-trim: spasi bisa menjadi bagian password.
    password: isian.password,
  };
}

/** Validasi sisi klien sesuai Aturan akun (N7); `null` jika isian boleh dikirim. */
export function validasiRegister(isian: IsianRegister): GalatRegister | null {
  const { nama, email, password } = bodyRegister(isian);
  const fields: GalatRegister["fields"] = {};

  if (!nama) fields.nama = "Nama wajib diisi.";
  else if (nama.length > MAKS_NAMA) fields.nama = `Nama maksimal ${MAKS_NAMA} karakter.`;

  if (!email) fields.email = "Email wajib diisi.";
  else if (!POLA_EMAIL.test(email)) fields.email = "Format email tidak valid.";
  else if (email.length > MAKS_EMAIL) fields.email = `Email maksimal ${MAKS_EMAIL} karakter.`;

  if (password.length < MIN_PASSWORD) {
    fields.password = `Password minimal ${MIN_PASSWORD} karakter.`;
  } else if (password.length > MAKS_PASSWORD) {
    fields.password = `Password maksimal ${MAKS_PASSWORD} karakter.`;
  } else if (password === email) {
    fields.password = "Password tidak boleh sama dengan email.";
  }

  return Object.keys(fields).length > 0 ? { fields } : null;
}

/** Ubah error dari `authApi.register` menjadi pesan yang ditampilkan di form. */
export function galatDariError(error: unknown): GalatRegister {
  if (!(error instanceof ApiError)) {
    return { umum: PESAN_ERROR.INTERNAL_ERROR, fields: {} };
  }

  if (error.code === "EMAIL_TERDAFTAR") {
    return { fields: { email: error.message } };
  }

  if (error.code === "FORMAT_TIDAK_VALID" && error.fields) {
    const fields: GalatRegister["fields"] = {};
    for (const kunci of ["nama", "email", "password"] as const) {
      if (error.fields[kunci]) fields[kunci] = error.fields[kunci];
    }
    // Field lain di luar form ditampilkan sebagai pesan umum agar tidak hilang.
    return Object.keys(fields).length > 0 ? { fields } : { umum: error.message, fields: {} };
  }

  return { umum: error.message, fields: {} };
}

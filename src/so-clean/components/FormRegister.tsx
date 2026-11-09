/**
 * Form Register (FE-07). Sumber: frame Figma "Register Page" (24:106), I-02.
 *
 * Objek DPPL: IO2-001 Nama, IO2-002 Email, IO2-004 Password, IO2-005 tombol Daftar,
 * IO2-006 tautan Masuk. IO2-003 "Lupa password" sengaja tidak dibuat (K11).
 *
 * `POST /api/auth/register` tidak memasang cookie session (BE-05), jadi setelah register
 * berhasil form langsung memanggil login dengan isian yang sama agar pengguna masuk ke Beranda.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Textbox, notify } from "@/components/ui";
import { authApi } from "@/lib/api/endpoints";
import {
  MAKS_NAMA,
  MAKS_PASSWORD,
  bodyRegister,
  galatDariError,
  validasiRegister,
  type GalatRegister,
  type IsianRegister,
} from "@/lib/register";

/**
 * Tujuan sementara setelah register berhasil.
 * TODO(FE-03): ganti dengan `ROUTE.beranda` dari `lib/nav.ts` (I-03) setelah FE-03 masuk `dev`.
 */
const TUJUAN_SETELAH_REGISTER = "/";

/** Route halaman Login (FE-06). */
const ROUTE_LOGIN = "/login";

const ISIAN_KOSONG: IsianRegister = { nama: "", email: "", password: "" };

export function FormRegister() {
  const router = useRouter();
  const [isian, setIsian] = useState<IsianRegister>(ISIAN_KOSONG);
  const [galat, setGalat] = useState<GalatRegister | null>(null);
  const [memuat, setMemuat] = useState(false);

  function ubah(kunci: keyof IsianRegister, nilai: string) {
    setIsian((lama) => ({ ...lama, [kunci]: nilai }));
  }

  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (memuat) return;

    const galatKlien = validasiRegister(isian);
    setGalat(galatKlien);
    if (galatKlien) return;

    setMemuat(true);
    const body = bodyRegister(isian);
    try {
      await authApi.register(body);
    } catch (error) {
      setGalat(galatDariError(error));
      setMemuat(false);
      return;
    }

    try {
      await authApi.login({ email: body.email, password: body.password });
      router.replace(TUJUAN_SETELAH_REGISTER);
      // Tombol tetap memuat sampai halaman berpindah, agar tidak bisa diklik dua kali.
    } catch {
      // Akun sudah dibuat; jangan minta daftar ulang. Arahkan ke Login untuk masuk manual.
      notify.sukses("Akun berhasil dibuat. Silakan masuk.");
      router.replace(ROUTE_LOGIN);
    }
  }

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-7">
      <Textbox
        label="Nama"
        name="nama"
        autoComplete="name"
        placeholder="Nama lengkap"
        maxLength={MAKS_NAMA}
        value={isian.nama}
        onChange={(e) => ubah("nama", e.target.value)}
        error={galat?.fields.nama}
        disabled={memuat}
      />
      <Textbox
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={isian.email}
        onChange={(e) => ubah("email", e.target.value)}
        error={galat?.fields.email}
        disabled={memuat}
      />
      <Textbox
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Minimal 8 karakter"
        maxLength={MAKS_PASSWORD}
        value={isian.password}
        onChange={(e) => ubah("password", e.target.value)}
        error={galat?.fields.password}
        petunjuk="8–72 karakter dan tidak sama dengan email."
        disabled={memuat}
      />

      {galat?.umum && (
        <p
          role="alert"
          className="rounded-button bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {galat.umum}
        </p>
      )}

      <Button type="submit" ukuran="lg" lebarPenuh memuat={memuat}>
        Daftar
      </Button>

      <p className="py-2.5 text-center text-body text-dark-teal">
        Sudah punya akun?{" "}
        <Link
          href={ROUTE_LOGIN}
          className="font-medium underline underline-offset-2 hover:text-emerald"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}

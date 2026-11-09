/**
 * Form Login (FE-06). Sumber: frame Figma "Login Page" (12:19), I-01.
 *
 * Objek DPPL: IO1-001 Email, IO1-003 Password, IO1-004 tombol Masuk, IO1-005 tautan Daftar.
 * IO1-002 "Lupa password" sengaja tidak dibuat (K11).
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Textbox } from "@/components/ui";
import { authApi } from "@/lib/api/endpoints";
import {
  galatDariError,
  normalisasiEmail,
  tujuanSetelahLogin,
  validasiLogin,
  type GalatLogin,
} from "@/lib/login";

export function FormLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState<GalatLogin | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (memuat) return;

    const galatKlien = validasiLogin({ email, password });
    setGalat(galatKlien);
    if (galatKlien) return;

    setMemuat(true);
    try {
      const pengguna = await authApi.login({ email: normalisasiEmail(email), password });
      router.replace(tujuanSetelahLogin(pengguna.role));
      // Tombol tetap memuat sampai halaman berpindah, agar tidak bisa diklik dua kali.
    } catch (error) {
      setGalat(galatDariError(error));
      setMemuat(false);
    }
  }

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-7">
      <Textbox
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={galat?.fields.email}
        disabled={memuat}
      />
      <Textbox
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Masukkan password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={galat?.fields.password}
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
        Masuk
      </Button>

      <p className="py-2.5 text-center text-body text-dark-teal">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-2 hover:text-emerald"
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}

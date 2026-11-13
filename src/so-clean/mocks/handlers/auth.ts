/** Mock auth: register, login, logout, /api/me (BE-05, aturan akun N7). */
import { delay, http } from "msw";
import type { AuthResponse, MeResponse } from "../../types/api";
import { db, setSesi, type PenggunaMock } from "../db";
import { API, GagalMock, bacaJson, sukses, tanganiError, wajibLogin } from "../utils";

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function keAuthResponse(p: PenggunaMock): AuthResponse {
  return { id: p.id, nama: p.nama, email: p.email, role: p.role };
}

function teks(nilai: unknown): string {
  return typeof nilai === "string" ? nilai : "";
}

export const authHandlers = [
  http.post(
    `${API}/auth/register`,
    tanganiError(async ({ request }) => {
      await delay();
      const body = await bacaJson(request);
      const nama = teks(body.nama).trim();
      const email = teks(body.email).trim().toLowerCase();
      const password = teks(body.password);

      const fields: Record<string, string> = {};
      if (nama.length < 1 || nama.length > 100) fields.nama = "Nama harus 1–100 karakter.";
      if (!POLA_EMAIL.test(email)) fields.email = "Format email tidak valid.";
      if (password.length < 8 || password.length > 72) {
        fields.password = "Password harus 8–72 karakter.";
      } else if (password.toLowerCase() === email) {
        fields.password = "Password tidak boleh sama dengan email.";
      }
      if (Object.keys(fields).length > 0) throw new GagalMock("FORMAT_TIDAK_VALID", fields);

      if (db.pengguna.some((p) => p.email === email)) throw new GagalMock("EMAIL_TERDAFTAR");

      const pengguna: PenggunaMock = {
        id: crypto.randomUUID(),
        nama,
        email,
        password,
        role: "MASYARAKAT",
        saldoPoin: 0,
        notifikasiDilihatAt: null,
      };
      db.pengguna.push(pengguna);
      // Asumsi mock: register langsung login agar FE-07 bisa lanjut ke Beranda.
      setSesi(pengguna.id);
      return sukses(keAuthResponse(pengguna));
    }),
  ),

  http.post(
    `${API}/auth/login`,
    tanganiError(async ({ request }) => {
      await delay();
      const body = await bacaJson(request);
      const email = teks(body.email).trim().toLowerCase();
      const password = teks(body.password);
      const pengguna = db.pengguna.find((p) => p.email === email && p.password === password);
      // Satu pesan generik untuk email tidak terdaftar maupun password salah (N7).
      if (!pengguna) throw new GagalMock("LOGIN_GAGAL");
      setSesi(pengguna.id);
      return sukses(keAuthResponse(pengguna));
    }),
  ),

  http.post(
    `${API}/auth/logout`,
    tanganiError(async () => {
      wajibLogin();
      setSesi(null);
      return sukses({ ok: true as const });
    }),
  ),

  http.get(
    `${API}/me`,
    tanganiError(async () => {
      await delay();
      const p = wajibLogin();
      const me: MeResponse = { ...keAuthResponse(p), saldoPoin: p.saldoPoin };
      return sukses(me);
    }),
  ),
];

/** Controller auth: validasi request, hash password, session, dan pemetaan respons kontrak. */
import type { AuthResponse, MeResponse } from "@/types/api";
import { ApiError } from "@/server/api/errors";
import { apiSuccess } from "@/server/api/responses";
import { parseJsonBody } from "@/server/api/validation";
import { loginSchema, registerSchema } from "@/server/auth/account";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { deleteSessionCookie, setSessionCookie } from "@/server/auth/session-cookie";
import * as PenggunaModel from "@/server/models/pengguna";

const PESAN_LOGIN_GAGAL = "Email atau password salah.";

/** POST /api/auth/register. Register publik selalu membuat role MASYARAKAT. */
export async function register(request: Request): Promise<Response> {
  const input = await parseJsonBody(request, registerSchema);
  const passwordHash = await hashPassword(input.password);
  const pengguna = await PenggunaModel.buatMasyarakat({
    nama: input.nama,
    email: input.email,
    passwordHash,
  });

  if (!pengguna) {
    throw new ApiError("EMAIL_TERDAFTAR", "Email sudah terdaftar.", {
      email: "Email sudah digunakan.",
    });
  }

  const data: AuthResponse = pengguna;
  return apiSuccess(data);
}

/** POST /api/auth/login. Semua kegagalan kredensial memakai pesan generik yang sama. */
export async function login(request: Request): Promise<Response> {
  const input = await parseJsonBody(request, loginSchema);
  const pengguna = await PenggunaModel.cariUntukLogin(input.email);

  if (!pengguna || !(await verifyPassword(input.password, pengguna.passwordHash))) {
    throw new ApiError("LOGIN_GAGAL", PESAN_LOGIN_GAGAL);
  }

  await setSessionCookie({ idPengguna: pengguna.id, role: pengguna.role });

  const data: AuthResponse = {
    id: pengguna.id,
    nama: pengguna.nama,
    email: pengguna.email,
    role: pengguna.role,
  };
  return apiSuccess(data);
}

/** POST /api/auth/logout. Route handler memastikan session valid sebelum memanggil fungsi ini. */
export async function logout(): Promise<Response> {
  await deleteSessionCookie();
  return apiSuccess({ ok: true as const });
}

/** GET /api/me. Sumber nama dan saldo selalu database, bukan claim JWT. */
export async function getProfil(idPengguna: string): Promise<Response> {
  const pengguna = await PenggunaModel.getMe(idPengguna);
  if (!pengguna) {
    throw new ApiError("UNAUTHORIZED", "Sesi tidak valid atau telah berakhir.");
  }

  const data: MeResponse = pengguna;
  return apiSuccess(data);
}

import { cookies } from "next/headers";
import { ApiError } from "@/server/api";
import type { Role } from "@/types/api";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session-token";

/** Hanya panggil dari Route Handler/Server Function agar Next.js dapat mengirim Set-Cookie. */
export async function setSessionCookie(session: SessionPayload): Promise<void> {
  const token = await signSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
}

/** Baca dan verifikasi cookie; cookie hilang/invalid/kedaluwarsa berarti belum login. */
export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Route handlers memanggil ini pada setiap endpoint yang mensyaratkan login. */
export async function requireSessionCookie(): Promise<SessionPayload> {
  const session = await getSessionCookie();
  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Sesi tidak valid atau telah berakhir.");
  }
  return session;
}

/** Role guard untuk Route Handler; pastikan dipanggil per endpoint, bukan hanya di Proxy. */
export async function requireRoleCookie(requiredRole: Role): Promise<SessionPayload> {
  const session = await requireSessionCookie();
  if (session.role !== requiredRole) {
    throw new ApiError("FORBIDDEN", "Role tidak memiliki akses ke endpoint ini.");
  }
  return session;
}

/** Hapus cookie sesi saat logout. */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

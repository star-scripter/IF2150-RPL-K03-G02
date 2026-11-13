import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/types/api";

export const SESSION_COOKIE_NAME = "soclean_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  idPengguna: string;
  role: Role;
};

function sessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum dikonfigurasi.");
  return new TextEncoder().encode(secret);
}

/** Opsi cookie sesi untuk Next.js cookies().set(); cookie tidak dapat dibaca JavaScript klien. */
export function sessionCookieOptions(isProduction = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** Buat JWT HS256 berisi idPengguna dan role dengan masa berlaku tujuh hari. */
export async function signSessionToken(
  session: SessionPayload,
  issuedAt = new Date(),
): Promise<string> {
  const issuedAtSeconds = Math.floor(issuedAt.getTime() / 1000);
  return new SignJWT({ idPengguna: session.idPengguna, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(issuedAtSeconds + SESSION_TTL_SECONDS)
    .sign(sessionKey());
}

/** Token invalid/kedaluwarsa menghasilkan null; secret yang tidak dikonfigurasi tetap melempar error. */
export async function verifySessionToken(
  token: string,
  currentDate = new Date(),
): Promise<SessionPayload | null> {
  const key = sessionKey();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      currentDate,
    });

    if (
      typeof payload.idPengguna !== "string" ||
      (payload.role !== "MASYARAKAT" && payload.role !== "OPERATOR")
    ) {
      return null;
    }

    return { idPengguna: payload.idPengguna, role: payload.role };
  } catch {
    return null;
  }
}

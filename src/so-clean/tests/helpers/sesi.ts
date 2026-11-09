/** Helper test: membuat cookie sesi bertanda tangan dan request ke route handler. */
import { SESSION_COOKIE_NAME, signSessionToken } from "@/server/auth/session-token";
import type { Role } from "@/types/api";

// Secret khusus test; dipakai hanya jika env belum menyediakan SESSION_SECRET.
process.env.SESSION_SECRET ??= "secret-khusus-test-soclean";

export async function cookieSesi(idPengguna: string, role: Role): Promise<string> {
  const token = await signSessionToken({ idPengguna, role });
  return `${SESSION_COOKIE_NAME}=${token}`;
}

/** Buat `Request` ke `http://localhost{path}`, opsional dengan cookie sesi dan body JSON. */
export function buatRequest(
  path: string,
  opsi: { method?: string; cookie?: string; body?: unknown } = {},
): Request {
  const headers = new Headers();
  if (opsi.cookie) headers.set("cookie", opsi.cookie);
  if (opsi.body !== undefined) headers.set("content-type", "application/json");

  return new Request(`http://localhost${path}`, {
    method: opsi.method ?? "GET",
    headers,
    body: opsi.body === undefined ? undefined : JSON.stringify(opsi.body),
  });
}

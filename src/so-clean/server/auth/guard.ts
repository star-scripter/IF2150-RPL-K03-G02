/**
 * Cek sesi dan role di route handler (akses endpoint di kontrak: Login, Masyarakat, Operator).
 *
 * Ini penjaga akses yang sebenarnya untuk endpoint API (BE-06). `proxy.ts` hanya mengecek sesi
 * secara cepat untuk redirect halaman, sehingga setiap route handler tetap wajib memanggil
 * `wajibLogin` dengan role yang sesuai kontrak.
 *
 * Dipanggil di dalam `handleApiRequest`, sehingga `ApiError` yang dilempar di sini otomatis
 * menjadi respons 401/403 sesuai kontrak:
 *
 *   export function GET(request: Request) {
 *     return handleApiRequest(request, "/api/poin/saldo", async () => {
 *       const sesi = await wajibLogin(request, ["MASYARAKAT"]);
 *       return lihatSaldo(sesi);
 *     });
 *   }
 */
import { ApiError } from "@/server/api";
import type { Role } from "@/types/api";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from "./session-token";

export type Sesi = SessionPayload;

/** Ambil nilai satu cookie dari header `Cookie` request. */
function bacaCookie(request: Request, nama: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const bagian of header.split(";")) {
    const pemisah = bagian.indexOf("=");
    if (pemisah === -1 || bagian.slice(0, pemisah).trim() !== nama) continue;
    const nilai = bagian.slice(pemisah + 1).trim();
    try {
      return decodeURIComponent(nilai);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Pastikan request berasal dari pengguna yang login (401 `UNAUTHORIZED` jika tidak) dan, jika
 * `roles` diisi, role-nya termasuk di dalamnya (403 `FORBIDDEN` jika tidak).
 * Sesi hanya berisi `idPengguna` dan `role`; data lain dibaca dari database oleh controller.
 */
export async function wajibLogin(request: Request, roles?: readonly Role[]): Promise<Sesi> {
  const token = bacaCookie(request, SESSION_COOKIE_NAME);
  const sesi = token ? await verifySessionToken(token) : null;

  if (!sesi) {
    throw new ApiError("UNAUTHORIZED", "Silakan login terlebih dahulu.");
  }
  if (roles && !roles.includes(sesi.role)) {
    throw new ApiError("FORBIDDEN", "Anda tidak memiliki akses ke fitur ini.");
  }
  return sesi;
}

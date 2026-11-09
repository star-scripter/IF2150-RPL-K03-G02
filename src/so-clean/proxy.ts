import { NextResponse, type NextRequest } from "next/server";
import { aturanHalaman } from "@/lib/akses";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/server/auth/session-token";
import type { Role } from "@/types/api";

/**
 * Pemeriksaan sesi cepat untuk navigasi halaman saja (BE-06), plus pengarahan sesuai role
 * (FE-05, aturan di `lib/akses.ts`).
 * Akses API dan role tetap harus diperiksa di masing-masing Route Handler.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Defense in depth: jangan pernah mengandalkan Proxy sebagai API guard.
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const keputusan = aturanHalaman(pathname, await roleDariSesi(request));
  return keputusan.aksi === "lanjut"
    ? NextResponse.next()
    : NextResponse.redirect(new URL(keputusan.ke, request.url));
}

/** Role dari cookie sesi; `null` jika tidak ada, tidak valid, atau kedaluwarsa. */
async function roleDariSesi(request: NextRequest): Promise<Role | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return (await verifySessionToken(token))?.role ?? null;
  } catch {
    // Misconfigured/invalid session configuration fails closed for page navigation.
    return null;
  }
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};

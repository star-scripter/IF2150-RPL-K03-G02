import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/server/auth/session-token";

const HALAMAN_PUBLIK = new Set(["/login", "/register"]);

/**
 * Pemeriksaan sesi cepat untuk navigasi halaman saja.
 * Akses API dan role tetap harus diperiksa di masing-masing Route Handler.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Defense in depth: jangan pernah mengandalkan Proxy sebagai API guard.
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    HALAMAN_PUBLIK.has(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const session = await verifySessionToken(token);
    if (session) return NextResponse.next();
  } catch {
    // Misconfigured/invalid session configuration fails closed for page navigation.
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};

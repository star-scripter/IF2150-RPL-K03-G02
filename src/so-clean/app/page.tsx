import { redirect } from "next/navigation";
import { ROUTE } from "@/lib/nav";

/**
 * Route `/`. Proxy (FE-05, `lib/akses.ts`) sudah mengarahkan `/` ke halaman awal sesuai role,
 * atau ke Login untuk tamu. Halaman ini hanya cadangan jika proxy tidak berjalan.
 */
export default function Home() {
  redirect(ROUTE.login);
}

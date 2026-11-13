/** Menu header desktop Masyarakat dengan item aktif sesuai route. Lihat `NavHeaderMasyarakat.tsx`. */
"use client";

import { usePathname } from "next/navigation";
import { NavHeaderMasyarakat } from "./NavHeaderMasyarakat";

export function NavHeaderMasyarakatAktif() {
  return <NavHeaderMasyarakat pathname={usePathname()} />;
}

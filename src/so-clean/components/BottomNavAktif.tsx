/** Bottom nav Masyarakat dengan item aktif sesuai route (FE-03). Lihat `BottomNav.tsx`. */
"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export function BottomNavAktif() {
  return <BottomNav pathname={usePathname()} />;
}

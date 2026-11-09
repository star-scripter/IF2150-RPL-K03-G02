/** Header Operator dengan nav aktif sesuai route (FE-03). Lihat `HeaderOperator.tsx`. */
"use client";

import { usePathname } from "next/navigation";
import { HeaderOperator } from "./HeaderOperator";

export function HeaderOperatorAktif() {
  return <HeaderOperator pathname={usePathname()} />;
}

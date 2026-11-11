/**
 * Header Operator dengan nav aktif sesuai route (FE-03) dan inisial nama Operator dari
 * GET /api/me (FE-24). Lihat `HeaderOperator.tsx`.
 */
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/endpoints";
import { HeaderOperator } from "./HeaderOperator";

export function HeaderOperatorAktif() {
  const pathname = usePathname();
  const [nama, setNama] = useState<string>();

  // Layout tetap ter-mount antarhalaman Operator, jadi /api/me cukup dimuat sekali.
  // Jika gagal, avatar tetap memakai inisial bawaan.
  useEffect(() => {
    const pengendali = new AbortController();
    authApi.me({ signal: pengendali.signal }).then(
      (pengguna) => setNama(pengguna.nama),
      () => {},
    );
    return () => pengendali.abort();
  }, []);

  return <HeaderOperator pathname={pathname} namaOperator={nama} />;
}

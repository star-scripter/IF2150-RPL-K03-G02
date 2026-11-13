/**
 * Tombol logout untuk Profil Masyarakat dan Operator (FE-24).
 */
"use client";

import { useRef, useState } from "react";
import { Button, notify } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { ROUTE } from "@/lib/nav";

export function TombolKeluar() {
  const [memuat, setMemuat] = useState(false);
  // State baru terbaca setelah render ulang; ref mencegah klik ganda mengirim dua request.
  const sedangKeluar = useRef(false);

  async function keluar() {
    if (sedangKeluar.current) return;
    sedangKeluar.current = true;
    setMemuat(true);
    try {
      await authApi.logout();
      // Navigasi penuh, bukan router: halaman yang disimpan cacheComponents (Activity) masih
      // berisi data akun ini dan harus ikut dibuang. Tombol tetap memuat sampai pindah halaman.
      window.location.assign(ROUTE.login);
    } catch (error) {
      notify.gagal(error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR"));
      sedangKeluar.current = false;
      setMemuat(false);
    }
  }

  return (
    <Button varian="bahaya" lebarPenuh memuat={memuat} onClick={keluar}>
      Keluar
    </Button>
  );
}

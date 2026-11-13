/**
 * Batas error semua halaman: tampil jika render halaman gagal tak terduga. Kegagalan API
 * sudah ditangani tiap halaman dengan `KotakGagal`, jadi ini hanya cadangan.
 */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { HalamanStatus } from "@/components/HalamanStatus";
import { Button, kelasButton } from "@/components/ui";

export default function HalamanError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <HalamanStatus
      judul="Terjadi kesalahan"
      keterangan="Halaman ini gagal ditampilkan. Coba lagi, atau kembali ke halaman awal jika masih gagal."
    >
      <Button lebarPenuh onClick={retry}>
        Coba lagi
      </Button>
      <Link href="/" className={kelasButton({ varian: "sekunder", lebarPenuh: true })}>
        Ke halaman awal
      </Link>
    </HalamanStatus>
  );
}

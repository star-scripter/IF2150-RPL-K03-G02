/**
 * Cadangan terakhir jika root layout sendiri gagal. Menggantikan seluruh dokumen, jadi
 * `<html>`, `<body>`, dan globals.css dipasang sendiri; font Google tidak dimuat.
 */
"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect } from "react";
import { HalamanStatus } from "@/components/HalamanStatus";
import { Button, kelasButton } from "@/components/ui";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>Terjadi kesalahan · SoClean</title>
        <HalamanStatus
          judul="Terjadi kesalahan"
          keterangan="SoClean gagal dimuat. Coba lagi, atau kembali ke halaman awal jika masih gagal."
        >
          <Button lebarPenuh onClick={retry}>
            Coba lagi
          </Button>
          <Link href="/" className={kelasButton({ varian: "sekunder", lebarPenuh: true })}>
            Ke halaman awal
          </Link>
        </HalamanStatus>
      </body>
    </html>
  );
}

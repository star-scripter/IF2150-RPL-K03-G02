/**
 * 404 untuk URL yang tidak cocok dengan route mana pun dan untuk `notFound()`.
 * "/" diarahkan proxy ke halaman awal sesuai role (Beranda, Validasi, atau Login).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { HalamanStatus } from "@/components/HalamanStatus";
import { kelasButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan · SoClean",
};

export default function NotFound() {
  return (
    <HalamanStatus
      judul="Halaman tidak ditemukan"
      keterangan="Alamat yang Anda buka tidak ada atau sudah dipindahkan."
    >
      <Link href="/" className={kelasButton({ lebarPenuh: true })}>
        Ke halaman awal
      </Link>
    </HalamanStatus>
  );
}

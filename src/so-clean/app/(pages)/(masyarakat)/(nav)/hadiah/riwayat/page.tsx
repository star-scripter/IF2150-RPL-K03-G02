/**
 * Route /hadiah/riwayat (riwayat penukaran).
 * Kelas DPPL: C12 - HalamanPenukaran
 *
 * Header dan bottom nav disediakan layout Masyarakat (FE-03); menu Hadiah aktif karena route
 * turunan /hadiah.
 */
import type { Metadata } from "next";
import RiwayatPenukaran from "@/components/RiwayatPenukaran";

export const metadata: Metadata = {
  title: "Riwayat Penukaran · SoClean",
};

export default function Page() {
  return <RiwayatPenukaran />;
}

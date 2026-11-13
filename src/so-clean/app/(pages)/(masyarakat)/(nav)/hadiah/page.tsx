/**
 * Route /hadiah (I-04).
 * Kelas DPPL: C12 - HalamanPenukaran
 *
 * Header dan bottom nav disediakan layout Masyarakat (FE-03).
 */
import type { Metadata } from "next";
import HalamanPenukaran from "@/components/HalamanPenukaran";

export const metadata: Metadata = {
  title: "Hadiah · SoClean",
};

export default function Page() {
  return <HalamanPenukaran />;
}

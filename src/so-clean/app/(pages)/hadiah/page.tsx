/**
 * Route /hadiah (I-04).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
import type { Metadata } from "next";
import HalamanPenukaran from "@/components/HalamanPenukaran";
import KerangkaSementara from "@/components/KerangkaSementara";

export const metadata: Metadata = {
  title: "Hadiah · SoClean",
};

export default function Page() {
  return (
    <KerangkaSementara aktif="hadiah">
      <HalamanPenukaran />
    </KerangkaSementara>
  );
}

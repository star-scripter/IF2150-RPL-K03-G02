/**
 * Route /hadiah/riwayat (riwayat penukaran).
 * Kelas DPPL: C12 - HalamanPenukaran
 *
 * TODO(FE-03): pindahkan ke app/(pages)/(masyarakat)/(nav)/hadiah/riwayat/ dan hapus
 * KerangkaSementara agar memakai header dan bottom nav dari layout FE-03.
 */
import type { Metadata } from "next";
import KerangkaSementara from "@/components/KerangkaSementara";
import RiwayatPenukaran from "@/components/RiwayatPenukaran";

export const metadata: Metadata = {
  title: "Riwayat Penukaran · SoClean",
};

export default function Page() {
  return (
    <KerangkaSementara aktif="hadiah">
      <RiwayatPenukaran />
    </KerangkaSementara>
  );
}

/**
 * Route /hadiah/berhasil (I-06).
 * Kelas DPPL: C12 - HalamanPenukaran
 *
 * Diletakkan di luar group `(nav)`: header dari layout Masyarakat (FE-03), tanpa bottom nav.
 */
import type { Metadata } from "next";
import PenukaranBerhasil from "@/components/PenukaranBerhasil";

export const metadata: Metadata = {
  title: "Penukaran Berhasil · SoClean",
};

export default function Page() {
  return <PenukaranBerhasil />;
}

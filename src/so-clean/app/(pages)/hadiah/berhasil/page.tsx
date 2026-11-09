/**
 * Route /hadiah/berhasil (I-06), tanpa bottom nav.
 * Kelas DPPL: C12 - HalamanPenukaran
 *
 * TODO(FE-03): pindahkan ke app/(pages)/(masyarakat)/hadiah/berhasil/ (di luar group (nav))
 * agar mendapat header dari layout FE-03.
 */
import type { Metadata } from "next";
import PenukaranBerhasil from "@/components/PenukaranBerhasil";

export const metadata: Metadata = {
  title: "Penukaran Berhasil · SoClean",
};

export default function Page() {
  return <PenukaranBerhasil />;
}

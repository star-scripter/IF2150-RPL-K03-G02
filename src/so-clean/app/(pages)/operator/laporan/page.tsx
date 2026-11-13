/**
 * Route /operator/laporan (I-07, FE-22). Detail laporan (I-08, FE-23) dibuka sebagai modal di
 * atas halaman ini, bukan route tersendiri.
 */
import type { Metadata } from "next";
import DaftarLaporan from "@/components/DaftarLaporan";

export const metadata: Metadata = {
  title: "Validasi laporan · SoClean",
};

export default function Page() {
  return <DaftarLaporan />;
}

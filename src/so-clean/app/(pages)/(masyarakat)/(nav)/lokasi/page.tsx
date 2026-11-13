/**
 * Route /lokasi: daftar I-09 dari FE-14 dan tampilan kosong I-10 dari FE-15.
 */
import type { Metadata } from "next";
import { DaftarLokasi } from "@/components/lokasi/DaftarLokasi";
import { LokasiKosong } from "@/components/lokasi/LokasiKosong";

export const metadata: Metadata = {
  title: "Lokasi · SoClean",
};

export default function Page() {
  return <DaftarLokasi kosong={<LokasiKosong />} />;
}

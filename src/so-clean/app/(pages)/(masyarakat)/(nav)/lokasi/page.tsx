/**
 * Route /lokasi (I-09): daftar FE-14; slot tampilan kosong tersedia untuk FE-15.
 */
import type { Metadata } from "next";
import { DaftarLokasi } from "@/components/lokasi/DaftarLokasi";

export const metadata: Metadata = {
  title: "Lokasi · SoClean",
};

export default function Page() {
  return <DaftarLokasi />;
}

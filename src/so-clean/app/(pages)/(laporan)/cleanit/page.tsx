import type { Metadata } from "next";
import { FormCleanIt } from "@/components/laporan/cleanit/FormCleanIt";

export const metadata: Metadata = { title: "Pilih Lokasi CleanIt · SoClean" };

/** Akses tanpa ID tetap kembali ke I-09 dengan pesan melalui notifikasi FE-02. */
export default function Page() {
  return <FormCleanIt idLokasi={null} />;
}

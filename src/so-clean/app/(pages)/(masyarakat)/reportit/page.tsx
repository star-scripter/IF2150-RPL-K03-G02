import type { Metadata } from "next";
import { FormLaporan } from "@/components/laporan/FormLaporan";

export const metadata: Metadata = { title: "Form Laporan · SoClean" };

/** I-11–I-13 menggunakan layout Masyarakat yang sudah ada, tanpa bottom nav. */
export default function Page() {
  return <FormLaporan />;
}

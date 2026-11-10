import type { Metadata } from "next";
import { FormReportIt } from "@/components/laporan/informasi-dasar/FormReportIt";

export const metadata: Metadata = { title: "Form Laporan · SoClean" };

/** URL tetap /reportit; I-11–I-13 memakai layout form responsif tanpa bottom nav. */
export default function Page() {
  return <FormReportIt />;
}

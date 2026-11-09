/**
 * Route /operator/laporan (I-07, I-08). Placeholder dari FE-03; isi halaman dikerjakan di FE-22 dan FE-23.
 */
import type { Metadata } from "next";
import { HalamanSementara } from "@/components/HalamanSementara";

export const metadata: Metadata = {
  title: "Validasi laporan · SoClean",
};

export default function Page() {
  return <HalamanSementara judul="Validasi laporan" tugas="FE-22 dan FE-23" berpadding={false} />;
}

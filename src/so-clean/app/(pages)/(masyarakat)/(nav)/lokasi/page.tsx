/**
 * Route /lokasi (I-09, I-10). Placeholder dari FE-03; isi halaman dikerjakan di FE-14 dan FE-15.
 */
import type { Metadata } from "next";
import { HalamanSementara } from "@/components/HalamanSementara";

export const metadata: Metadata = {
  title: "Lokasi · SoClean",
};

export default function Page() {
  return <HalamanSementara judul="Lokasi" tugas="FE-14 dan FE-15" />;
}

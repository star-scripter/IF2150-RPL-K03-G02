/**
 * Route /beranda (I-03). Placeholder dari FE-03; isi halaman dikerjakan di FE-08.
 */
import type { Metadata } from "next";
import { HalamanSementara } from "@/components/HalamanSementara";

export const metadata: Metadata = {
  title: "Beranda · SoClean",
};

export default function Page() {
  return <HalamanSementara judul="Beranda" tugas="FE-08" />;
}

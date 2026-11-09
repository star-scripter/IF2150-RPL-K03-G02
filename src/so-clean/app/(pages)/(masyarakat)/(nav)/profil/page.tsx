/**
 * Route /profil (Profil Masyarakat). Placeholder dari FE-03; isi halaman dikerjakan di FE-24.
 */
import type { Metadata } from "next";
import { HalamanSementara } from "@/components/HalamanSementara";

export const metadata: Metadata = {
  title: "Profil · SoClean",
};

export default function Page() {
  return <HalamanSementara judul="Profil" tugas="FE-24" />;
}

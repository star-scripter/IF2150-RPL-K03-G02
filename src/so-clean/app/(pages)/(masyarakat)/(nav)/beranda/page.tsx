/**
 * Route /beranda (I-03). Header dan bottom nav dari layout Masyarakat (FE-03).
 */
import type { Metadata } from "next";
import { Beranda } from "@/components/Beranda";

export const metadata: Metadata = {
  title: "Beranda · SoClean",
};

export default function Page() {
  return <Beranda />;
}

/**
 * Route /profil (Profil Masyarakat, FE-24). Header dan bottom nav dari layout Masyarakat (FE-03).
 */
import type { Metadata } from "next";
import { ProfilMasyarakat } from "@/components/ProfilMasyarakat";

export const metadata: Metadata = {
  title: "Profil · SoClean",
};

export default function Page() {
  return <ProfilMasyarakat />;
}

/**
 * Route /operator/profil (Profil Operator, FE-24). Header Operator dari layout Operator (FE-03).
 */
import type { Metadata } from "next";
import { ProfilOperator } from "@/components/ProfilOperator";

export const metadata: Metadata = {
  title: "Profil Operator · SoClean",
};

export default function Page() {
  return <ProfilOperator />;
}

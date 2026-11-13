import type { Metadata } from "next";
import { Suspense } from "react";
import { FormCleanIt } from "@/components/laporan/cleanit/FormCleanIt";
import { MemuatFormCleanIt } from "@/components/laporan/cleanit/StatusFormCleanIt";
import { bacaIdLokasi } from "@/lib/detail-lokasi";

export const metadata: Metadata = { title: "Bukti Pembersihan CleanIt · SoClean" };

export default function Page({ params }: PageProps<"/cleanit/[idLokasi]">) {
  return <Suspense fallback={<MemuatFormCleanIt />}><FormDariParam params={params} /></Suspense>;
}

async function FormDariParam({ params }: Pick<PageProps<"/cleanit/[idLokasi]">, "params">) {
  const { idLokasi } = await params;
  return <FormCleanIt key={idLokasi} idLokasi={bacaIdLokasi(idLokasi)} />;
}

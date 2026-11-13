import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailLokasi } from "@/components/lokasi/DetailLokasi";
import { KerangkaDetailLokasi } from "@/components/lokasi/KerangkaDetailLokasi";
import { bacaIdLokasi } from "@/lib/detail-lokasi";

export const metadata: Metadata = { title: "Detail Lokasi · SoClean" };

/** Params dinamis dibaca di dalam Suspense agar sesuai Cache Components Next.js 16. */
export default function Page({ params }: PageProps<"/lokasi/[idLokasi]">) {
  return <Suspense fallback={<KerangkaDetailLokasi />}><DetailDariParam params={params} /></Suspense>;
}

async function DetailDariParam({ params }: Pick<PageProps<"/lokasi/[idLokasi]">, "params">) {
  const { idLokasi } = await params;
  return <DetailLokasi key={idLokasi} idLokasi={bacaIdLokasi(idLokasi)} />;
}

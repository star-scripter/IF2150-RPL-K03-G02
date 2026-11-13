import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTE } from "@/lib/nav";

export function BingkaiDetailLokasi({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col gap-5 px-4 py-6 text-dark-teal min-[400px]:px-[35px] min-[400px]:py-[31px]">
    <Link href={ROUTE.lokasi} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-button text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal">
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Kembali ke Lokasi
    </Link>
    {children}
  </main>;
}

/** Dipakai saat params dinamis belum tersedia maupun saat GET detail masih berjalan. */
export function KerangkaDetailLokasi() {
  return <BingkaiDetailLokasi>
    <h1 className="text-h2">Detail Lokasi</h1>
    <div role="status" aria-label="Memuat detail lokasi" className="space-y-5">
      <span className="sr-only">Memuat detail lokasi…</span>
      <div aria-hidden className="space-y-3 rounded-card border border-border p-5">
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-10 animate-pulse rounded bg-surface" />
        <div className="h-56 animate-pulse rounded-button bg-surface" />
      </div>
      <div aria-hidden className="h-56 animate-pulse rounded-card border border-border bg-surface" />
    </div>
  </BingkaiDetailLokasi>;
}

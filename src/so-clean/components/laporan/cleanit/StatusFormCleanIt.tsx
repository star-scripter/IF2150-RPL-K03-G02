import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTE } from "@/lib/nav";
import { IkonLaporan } from "../VisualLaporan";

export function StatusFormCleanIt({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col gap-6 px-4 py-5 text-dark-teal md:px-0 md:py-0">
    <Link href={ROUTE.lokasi} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-button text-sm font-semibold focus-visible:outline-2 focus-visible:outline-dark-teal">
      <IkonLaporan nama="kembali" className="size-5" />Kembali ke daftar lokasi
    </Link>
    {children}
  </main>;
}

export function MemuatFormCleanIt() {
  return <StatusFormCleanIt>
    <div role="status" aria-live="polite" className="space-y-5">
      <h1 className="text-h2">Memeriksa lokasi pembersihan…</h1>
      <p className="text-sm text-text-secondary">Pastikan lokasi masih tersedia sebelum mengisi laporan.</p>
      <div aria-hidden className="grid animate-pulse gap-4 motion-reduce:animate-none md:grid-cols-2">
        <div className="h-24 rounded-card bg-border/50 md:col-span-2" />
        <div className="h-32 rounded-card bg-border/50" /><div className="h-32 rounded-card bg-border/50" />
      </div>
    </div>
  </StatusFormCleanIt>;
}

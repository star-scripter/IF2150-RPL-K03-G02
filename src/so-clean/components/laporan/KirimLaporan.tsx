"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ROUTE } from "@/lib/nav";
import { usePengirimanLaporan } from "./PengirimanLaporanProvider";
import { IkonLaporan } from "./VisualLaporan";

/** Dipasang lewat slot aksiKirim FE-09; submit keyboard dan klik memakai handler yang sama. */
export function KirimLaporan() {
  const { mengirim, error } = usePengirimanLaporan();
  return <>
    {error && <div id="error-kirim-laporan" role="alert" className="space-y-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-dark-teal">
      <p className="font-semibold">Laporan belum terkirim</p>
      <p>{error.pesan}</p>
      <p>Isian dan bukti Anda tetap tersimpan di form ini.</p>
      {error.pilihLokasiLain && <Link href={ROUTE.lokasi} className="inline-flex min-h-8 items-center font-semibold underline underline-offset-2">Lihat daftar lokasi</Link>}
    </div>}
    <Button type="submit" memuat={mengirim} lebarPenuh aria-describedby={error ? "error-kirim-laporan" : "petunjuk-kirim-laporan"}>
      {mengirim ? "Mengirim…" : "Kirim Laporan"}
      {!mengirim && <IkonLaporan nama="panah" className="size-4 -rotate-45" />}
    </Button>
    <p id="petunjuk-kirim-laporan" role="status" className="text-center text-xs leading-relaxed text-text-secondary">
      {mengirim ? "Tunggu sebentar, laporan sedang dikirim." : "Laporan akan diperiksa oleh operator SoClean."}
    </p>
  </>;
}

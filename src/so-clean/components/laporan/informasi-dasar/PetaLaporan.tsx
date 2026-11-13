"use client";

import dynamic from "next/dynamic";
import type { KoordinatLaporan } from "@/lib/informasi-dasar";

export type PropsPetaLaporan = {
  koordinat: KoordinatLaporan | null;
  pusat?: KoordinatLaporan;
  interaktif?: boolean;
  onPilih?: (koordinat: KoordinatLaporan) => void;
};

const PetaLeaflet = dynamic(() => import("./PetaLeafletLaporan"), {
  ssr: false,
  loading: () => <div role="status" className="flex h-full min-h-28 items-center justify-center bg-surface text-xs text-text-secondary">Memuat peta…</div>,
});

/** Leaflet hanya diunduh/dijalankan di browser; tidak mengakses window saat prerender Next.js. */
export function PetaLaporan(props: PropsPetaLaporan) {
  return <PetaLeaflet {...props} />;
}

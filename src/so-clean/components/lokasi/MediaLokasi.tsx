"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { formatWaktuLengkap } from "@/lib/laporan";
import type { Media } from "@/types/api";

/** Satu kegagalan media hanya mengganti pratinjaunya, bukan seluruh detail lokasi. */
export function MediaLokasi({ media, nomor }: { media: Media; nomor: number }) {
  const [gagal, setGagal] = useState(!media.url.trim());
  const video = useRef<HTMLVideoElement>(null);
  const jenis = media.tipe === "VIDEO" ? "Video" : "Foto";
  useEffect(() => {
    const elemen = video.current;
    // Cache Components menyembunyikan route saat navigasi; hentikan video pada cleanup.
    return () => elemen?.pause();
  }, [gagal, media.url]);

  return <figure className="min-w-0 space-y-2">
    {gagal ? <div role="status" className="space-y-3 rounded-button border border-border bg-surface p-4 text-sm text-text-secondary">
      <p>{jenis} bukti {nomor} belum dapat dimuat. Informasi laporan tetap tersedia.</p>
      {media.url.trim() && <Button varian="sekunder" onClick={() => setGagal(false)} className="min-h-9! px-3! py-2! text-xs!" aria-label={`Coba muat ulang ${jenis.toLowerCase()} ${nomor}`}>Coba muat ulang</Button>}
    </div> : media.tipe === "VIDEO" ? (
      <video ref={video} src={media.url} controls playsInline preload="metadata" aria-label={`Video bukti laporan asal ${nomor}`} onError={() => setGagal(true)} className="max-h-72 w-full rounded-button bg-surface object-contain" />
    ) : (
      <Image src={media.url} alt={`Foto bukti laporan asal ${nomor}`} width={800} height={600} unoptimized onError={() => setGagal(true)} className="max-h-72 w-full rounded-button bg-surface object-contain" />
    )}
    <figcaption className="space-y-1 text-xs leading-relaxed text-text-secondary">
      <p className="font-semibold text-dark-teal">{jenis} bukti {nomor}</p>
      <p>Diunggah <time dateTime={media.createdAt}>{formatWaktuLengkap(media.createdAt)}</time></p>
      {!gagal && media.tipe === "FOTO" && <a href={media.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center rounded-button font-semibold text-dark-teal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-dark-teal">Lihat foto ukuran penuh<span className="sr-only"> (tab baru)</span></a>}
    </figcaption>
  </figure>;
}

"use client";

import { useEffect, useReducer, useRef, type SVGProps } from "react";
import type { MediaFormLaporan } from "@/lib/form-laporan";
import { notify } from "@/components/ui/toast-store";
import { pesanGagalMedia } from "@/lib/bukti-media";

export function IkonLaporan({
  nama,
  ...props
}: SVGProps<SVGSVGElement> & { nama: "kembali" | "panah" | "unggah" | "pin" | "ubah" }) {
  const garis = {
    kembali: "m14 6-6 6 6 6",
    panah: "M5 12h14m-6-6 6 6-6 6",
    unggah: "M12 16V4m-5 5 5-5 5 5M6 17H5a4 4 0 0 1-.5-8A7.5 7.5 0 0 1 19 8a4.5 4.5 0 0 1 0 9h-1",
    pin: "M12 22s8-7 8-13A8 8 0 0 0 4 9c0 6 8 13 8 13Z",
    ubah: "m14 5 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-5-5L4 14v6Z",
  };
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={garis[nama]} />
      {nama === "pin" && <circle cx="12" cy="9" r="2.5" />}
    </svg>
  );
}

/** Ilustrasi mockup, bukan peta geografis. FE-10 mengganti slot ini dengan peta interaktif. */
export function PratinjauLokasi({ ringkas = false }: { ringkas?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Ilustrasi lokasi. Peta interaktif belum tersedia."
      className={`relative overflow-hidden rounded-button bg-light-green/20 ${ringkas ? "h-24 w-24 shrink-0 md:h-32 md:w-32" : "h-36 w-full md:h-52"}`}
    >
      <svg aria-hidden viewBox="0 0 400 160" preserveAspectRatio="none" className="absolute size-full">
        <path fill="#d9efdf" d="M0 0h400v160H0z" />
        <path fill="#c5eaf2" d="M280 0h120v160H280z" />
        <path stroke="white" strokeWidth="7" d="M90 0 15 160M190 0l90 160M0 95h280" />
        <rect x="14" y="12" width="64" height="40" rx="14" fill="#b7e2c6" />
      </svg>
      {!ringkas && <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs text-dark-teal">Pratinjau lokasi</span>}
    </div>
  );
}

/** URL blob dimiliki pratinjau yang terpasang; File tetap di provider saat langkah berganti. */
export function PratinjauMedia({ media, ringkas = false }: { media: MediaFormLaporan; ringkas?: boolean }) {
  const gambar = useRef<HTMLImageElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const adalahVideo = media.berkas.type === "video/mp4";
  const [gagal, aturGagal] = useReducer((_lama: boolean, baru: boolean) => baru, false);
  const hasil = media.unggahan?.url;

  useEffect(() => {
    const elemen = gambar.current ?? video.current;
    if (!elemen) return;
    let lokal: string | undefined;
    let memakaiLokal = false;
    function gagalLokal(error?: unknown) {
      aturGagal(true);
      notify.gagal(`Gagal menampilkan pratinjau ${media.berkas.name}. ${error ? pesanGagalMedia(error) : "File mungkin rusak atau tidak didukung perangkat ini."}`);
    }
    function pakaiLokal() {
      try { memakaiLokal = true; lokal = URL.createObjectURL(media.berkas); elemen!.src = lokal; }
      catch (error) { gagalLokal(error); }
    }
    const gagalMuat = () => { if (hasil && !memakaiLokal) pakaiLokal(); else gagalLokal(); };
    elemen.addEventListener("error", gagalMuat);
    aturGagal(false);
    // Hasil foto menampilkan watermark BE-08. File lokal tetap tersedia saat URL server gagal/offline.
    if (hasil) elemen.src = hasil;
    else pakaiLokal();
    return () => {
      elemen.removeEventListener("error", gagalMuat);
      elemen.removeAttribute("src");
      if (lokal) URL.revokeObjectURL(lokal);
    };
  }, [media.berkas, hasil]);

  const kelas = `${ringkas ? "h-20 md:h-32" : "h-32 md:h-40"} w-full rounded-button bg-border/30 object-contain`;
  return <div className="relative">
    {adalahVideo ? (
      <video ref={video} controls playsInline preload="metadata" aria-label={media.berkas.name} className={`${kelas} ${gagal ? "invisible" : ""}`} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- Blob lokal atau URL hasil unggah BE-08.
      <img ref={gambar} alt={media.berkas.name} className={`${kelas} ${gagal ? "invisible" : ""}`} />
    )}
    {gagal && <p className="absolute inset-0 flex items-center justify-center rounded-button bg-surface p-2 text-center text-xs text-text-secondary">Pratinjau tidak tersedia. Hapus dan pilih ulang bila file rusak.</p>}
  </div>;
}

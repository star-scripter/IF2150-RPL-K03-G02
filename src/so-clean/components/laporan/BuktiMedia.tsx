"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button, ProgressBar } from "@/components/ui";
import { MAKS_MEDIA_LAPORAN } from "@/lib/form-laporan";
import type { StatusUnggahan } from "@/lib/antrean-media";
import { useFormLaporan } from "./FormLaporanProvider";
import { IkonLaporan, PratinjauMedia } from "./VisualLaporan";
import { useUnggahMedia } from "./UnggahMediaProvider";

/** I-12 / FE-11. File dan hasil upload memakai state FE-09; antrean bertahan lintas langkah. */
export function BuktiMedia() {
  const { state } = useFormLaporan();
  const unggah = useUnggahMedia();
  const input = useRef<HTMLInputElement>(null);
  const { pesan } = unggah;
  const [diseret, setDiseret] = useState(false);

  function pilihDariInput(event: ChangeEvent<HTMLInputElement>) {
    void unggah.pilih(Array.from(event.target.files ?? []));
    // Memungkinkan berkas yang sama dipilih lagi setelah dihapus.
    event.target.value = "";
  }

  function jatuhkan(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDiseret(false);
    void unggah.pilih(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-8">
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <div className="flex items-start gap-3 rounded-card bg-emerald/10 p-4 text-xs leading-relaxed text-dark-teal">
          <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-blue font-bold">i</span>
          <p>Pastikan media yang diunggah jelas, relevan, dan sesuai dengan kondisi di lokasi.</p>
        </div>
        <input
          ref={input} id="laporan-media" type="file" multiple accept="image/jpeg,image/png,video/mp4"
          aria-label="Pilih bukti foto atau video" aria-describedby={pesan ? "error-media" : "petunjuk-media"}
          onChange={pilihDariInput} className="sr-only"
          tabIndex={-1}
          disabled={unggah.memilih}
        />
        <div
          onDragOver={(event) => { event.preventDefault(); setDiseret(true); }}
          onDragLeave={() => setDiseret(false)} onDrop={jatuhkan}
          className={`rounded-card border bg-white ${diseret ? "border-emerald outline-2 outline-emerald" : "border-dark-teal/30"}`}
        >
          <button
            type="button" onClick={() => input.current?.click()} disabled={unggah.memilih || state.media.length >= MAKS_MEDIA_LAPORAN}
            aria-describedby="petunjuk-media"
            className="flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-card p-5 text-center focus-visible:outline-2 focus-visible:outline-dark-teal disabled:cursor-not-allowed disabled:opacity-50 md:min-h-64 md:gap-3"
          >
            <IkonLaporan nama="unggah" className="size-10 text-dark-teal" />
            <span className="font-heading text-sm font-semibold text-dark-teal md:text-base">{unggah.memilih ? "Menyiapkan media…" : "Unggah Foto atau Video"}</span>
            <span className="text-xs text-text-secondary">Klik untuk memilih file atau seret ke sini</span>
            <span id="petunjuk-media" className="text-[11px] text-text-secondary">JPG, PNG, MP4 · Maks. 20 MB · Maks. 3 media</span>
          </button>
        </div>
        {pesan && <p id="error-media" role="alert" className="text-sm text-danger-text">{pesan}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <section aria-label="Media terpilih" className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Media terpilih ({state.media.length}/3)</h2>
          <div className="grid grid-cols-2 gap-3">
            {state.media.map((media) => (
              <figure key={media.idLokal} className="relative min-w-0">
                <PratinjauMedia media={media} />
                <button
                  type="button" aria-label={`Hapus ${media.berkas.name}`}
                  className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-dark-teal text-lg text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal"
                  onClick={() => unggah.hapus(media.idLokal)}
                >×</button>
                <figcaption className="mt-1 truncate text-xs text-text-secondary" title={media.berkas.name}>{media.berkas.name}</figcaption>
                <StatusMedia nama={media.berkas.name} nilai={media.unggahan ? { status: "berhasil" } : unggah.status[media.idLokal] ?? { status: "menunggu" }} online={unggah.online} cobaLagi={() => unggah.cobaLagi(media.idLokal)} />
              </figure>
            ))}
            {state.media.length < MAKS_MEDIA_LAPORAN && (
              <Button
                varian="sekunder" aria-label="Tambah media lainnya"
                className="min-h-32 flex-col border-dashed text-center text-sm"
                onClick={() => input.current?.click()}
                disabled={unggah.memilih}
              >
                <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-border text-xl">+</span>
                Tambah media<br />(lainnya)
              </Button>
            )}
          </div>
        </section>
        <p className="rounded-card bg-sky-blue/10 p-3 text-xs leading-relaxed text-dark-teal">Media yang dikirim akan ditinjau oleh operator SoClean.</p>
      </div>
    </div>
  );
}

function StatusMedia({ nama, nilai, online, cobaLagi }: { nama: string; nilai: StatusUnggahan; online: boolean; cobaLagi: () => void }) {
  return <div className="mt-2 space-y-2 text-xs leading-relaxed">
    {nilai.status === "menunggu" && <p role="status" className="text-warning-text">{online ? "Menunggu giliran" : "Menunggu koneksi"}</p>}
    {nilai.status === "mengunggah" && <>
      <p role="status" className="text-dark-teal">{nilai.persen === 100 ? "Memproses media…" : "Mengunggah…"}</p>
      {nilai.persen !== null ? <ProgressBar nilai={nilai.persen} label={`Unggah ${nama}`} tampilkanPersen /> : <div role="progressbar" aria-label={`Unggah ${nama}`} aria-valuemin={0} aria-valuemax={100} className="h-2 animate-pulse rounded-full bg-emerald/20" />}
    </>}
    {nilai.status === "berhasil" && <p role="status" className="font-semibold text-dark-teal">✓ Berhasil diunggah</p>}
    {nilai.status === "gagal" && <>
      <p role="alert" className="text-danger-text [overflow-wrap:anywhere]">{nilai.pesan}</p>
      {nilai.bisaUlang ? <Button varian="sekunder" onClick={cobaLagi} className="min-h-9! w-full px-2! py-1! text-xs!" aria-label={`Coba lagi ${nama}`}>Coba lagi</Button>
        : <p className="text-text-secondary">Hapus dan pilih media lain.</p>}
    </>}
  </div>;
}

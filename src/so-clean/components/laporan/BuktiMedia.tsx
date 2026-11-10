"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui";
import { MAKS_MEDIA_LAPORAN, MAKS_UKURAN_MEDIA } from "@/lib/form-laporan";
import { useFormLaporan } from "./FormLaporanProvider";
import { IkonLaporan, PratinjauMedia } from "./VisualLaporan";

/** Pemilihan lokal saja. Upload, progress, retry dan offline adalah integrasi FE-11. */
export function BuktiMedia() {
  const { state, dispatch } = useFormLaporan();
  const input = useRef<HTMLInputElement>(null);
  const [pesan, setPesan] = useState("");
  const [diseret, setDiseret] = useState(false);

  function pilih(berkas: File[]) {
    if (!berkas.length) return;
    if (state.media.length + berkas.length > MAKS_MEDIA_LAPORAN) {
      setPesan("Maksimal 3 media. Hapus salah satu media sebelum menambahkan yang baru.");
      return;
    }
    if (berkas.some((file) => !["image/jpeg", "image/png", "video/mp4"].includes(file.type))) {
      setPesan("Pilih foto JPG/PNG atau video MP4.");
      return;
    }
    if (berkas.some((file) => file.size === 0 || file.size > MAKS_UKURAN_MEDIA)) {
      setPesan("Berkas harus berisi data dan berukuran maksimal 20 MB per media.");
      return;
    }
    dispatch({
      tipe: "tambah-media",
      media: berkas.map((file) => ({ idLokal: crypto.randomUUID(), berkas: file, unggahan: null })),
    });
    setPesan("");
  }

  function pilihDariInput(event: ChangeEvent<HTMLInputElement>) {
    pilih(Array.from(event.target.files ?? []));
    // Memungkinkan berkas yang sama dipilih lagi setelah dihapus.
    event.target.value = "";
  }

  function jatuhkan(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDiseret(false);
    pilih(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-card bg-emerald/10 p-4 text-xs leading-relaxed text-dark-teal">
        <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-blue font-bold">i</span>
        <p>Pastikan media yang diunggah jelas, relevan, dan sesuai dengan kondisi di lokasi.</p>
      </div>
      <input
        ref={input} id="laporan-media" type="file" multiple accept="image/jpeg,image/png,video/mp4"
        aria-label="Pilih bukti foto atau video" aria-describedby={pesan ? "error-media" : "petunjuk-media"}
        onChange={pilihDariInput} className="sr-only"
        tabIndex={-1}
      />
      <div
        onDragOver={(event) => { event.preventDefault(); setDiseret(true); }}
        onDragLeave={() => setDiseret(false)} onDrop={jatuhkan}
        className={`rounded-card border bg-white ${diseret ? "border-emerald outline-2 outline-emerald" : "border-dark-teal/30"}`}
      >
        <button
          type="button" onClick={() => input.current?.click()} disabled={state.media.length >= MAKS_MEDIA_LAPORAN}
          aria-describedby="petunjuk-media"
          className="flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-card p-5 text-center focus-visible:outline-2 focus-visible:outline-dark-teal disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IkonLaporan nama="unggah" className="size-10 text-dark-teal" />
          <span className="font-heading text-sm font-semibold text-dark-teal">Unggah Foto atau Video</span>
          <span className="text-xs text-text-secondary">Klik untuk memilih file atau seret ke sini</span>
          <span id="petunjuk-media" className="text-[11px] text-text-secondary">JPG, PNG, MP4 · Maks. 20 MB · Maks. 3 media</span>
        </button>
      </div>
      {pesan && <p id="error-media" role="alert" className="text-sm text-danger-text">{pesan}</p>}
      <section aria-label="Media terpilih" className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Media terpilih ({state.media.length}/3)</h2>
        <div className="grid grid-cols-2 gap-3">
          {state.media.map((media) => (
            <figure key={media.idLokal} className="relative min-w-0">
              <PratinjauMedia media={media} />
              <button
                type="button" aria-label={`Hapus ${media.berkas.name}`}
                className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-dark-teal text-lg text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal"
                onClick={() => { dispatch({ tipe: "hapus-media", idLokal: media.idLokal }); setPesan(""); }}
              >×</button>
              <figcaption className="mt-1 truncate text-xs text-text-secondary" title={media.berkas.name}>{media.berkas.name}</figcaption>
            </figure>
          ))}
          {state.media.length < MAKS_MEDIA_LAPORAN && (
            <Button
              varian="sekunder" aria-label="Tambah media lainnya"
              className="min-h-32 flex-col border-dashed text-center text-sm"
              onClick={() => input.current?.click()}
            >
              <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-border text-xl">+</span>
              Tambah media<br />(lainnya)
            </Button>
          )}
        </div>
      </section>
      <p className="rounded-card bg-sky-blue/10 p-3 text-xs leading-relaxed text-dark-teal">Media yang dikirim akan ditinjau oleh operator SoClean.</p>
    </div>
  );
}

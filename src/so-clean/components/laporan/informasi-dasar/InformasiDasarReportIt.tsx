"use client";

import { useEffect, useRef } from "react";
import { Dropdown, Textarea, Textbox } from "@/components/ui";
import { LABEL_JENIS_SAMPAH, LABEL_SUMBER, type InformasiLaporan } from "@/lib/form-laporan";
import { MAKS_JUDUL } from "@/lib/judul";
import { ambilKoordinat, waktuMaksimumWib, type ErrorInformasi, type FieldInformasi } from "@/lib/informasi-dasar";
import { useFormLaporan } from "../FormLaporanProvider";
import { PilihLokasiLaporan } from "./PilihLokasiLaporan";

type Props = { error: ErrorInformasi; percobaan: number; onPerubahan: (informasi: InformasiLaporan) => void };
const LABEL_FIELD: Record<FieldInformasi, string> = { judul: "Judul laporan", lokasi: "Alamat / deskripsi lokasi", koordinat: "Titik lokasi", waktu: "Waktu kejadian", sumber: "Sumber laporan", jenisSampah: "Jenis sampah" };

/** I11/FE-10 memakai draf FE-09; pergantian langkah tidak membuat state informasi baru. */
export function InformasiDasarReportIt({ error, percobaan, onPerubahan }: Props) {
  const { state, dispatch } = useFormLaporan();
  const { informasi } = state;
  const ringkasan = useRef<HTMLDivElement>(null);
  const percobaanTerakhir = useRef(percobaan);
  const jumlahError = Object.keys(error).length;
  useEffect(() => {
    if (percobaanTerakhir.current === percobaan) return;
    percobaanTerakhir.current = percobaan;
    if (jumlahError) { ringkasan.current?.focus(); ringkasan.current?.scrollIntoView({ block: "center", behavior: "instant" }); }
  }, [percobaan, jumlahError]);
  function atur(perubahan: Partial<InformasiLaporan>) {
    dispatch({ tipe: "informasi", perubahan });
    onPerubahan({ ...informasi, ...perubahan });
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
      {jumlahError > 0 && <div ref={ringkasan} tabIndex={-1} role="alert" className="rounded-card border border-danger bg-danger-bg p-4 text-sm text-danger-text outline-none focus-visible:outline-2 focus-visible:outline-danger md:col-span-2">
        <p className="mb-2 font-semibold">Periksa kembali informasi laporan.</p>
        <ul className="list-inside list-disc space-y-1">{Object.entries(error).map(([field, pesan]) => <li key={field}><button type="button" className="text-left underline underline-offset-2" onClick={() => document.getElementById(`laporan-${field}`)?.focus()}>{LABEL_FIELD[field as FieldInformasi]}: {pesan}</button></li>)}</ul>
      </div>}
      <div className="min-w-0 md:col-span-2"><Textbox
        id="laporan-judul" label="Judul Laporan" ukuranLabel="ringkas" wajib maxLength={MAKS_JUDUL}
        value={informasi.judul} labelKanan={`${informasi.judul.length}/${MAKS_JUDUL}`} error={error.judul}
        placeholder="Contoh: Sampah plastik di tepi sungai"
        onChange={(event) => atur({ judul: event.target.value })} onBlur={() => atur({ judul: informasi.judul.trim() })}
      /></div>
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <section aria-label="Lokasi Pencemaran" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold">Lokasi Pencemaran <span aria-hidden>*</span></h2>
          <PilihLokasiLaporan nilai={ambilKoordinat(informasi)} onPilih={(point) => atur(point)} error={error.koordinat} />
        </section>
        <Textarea id="laporan-lokasi" label="Alamat / Deskripsi Lokasi" ukuranLabel="ringkas" wajib rows={2} maxLength={255}
          value={informasi.lokasi} error={error.lokasi} placeholder="Contoh: Pantai Ancol, Jakarta Utara"
          onChange={(event) => atur({ lokasi: event.target.value })} onBlur={() => atur({ lokasi: informasi.lokasi.trim() })}
          petunjuk="Jelaskan titik pencemaran agar mudah ditemukan." />
      </div>
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <Textbox id="laporan-waktu" label="Waktu Kejadian" ukuranLabel="ringkas" wajib type="datetime-local" value={informasi.waktu}
          error={error.waktu} petunjuk="Tanggal dan waktu dalam WIB. Waktu kejadian tidak boleh di masa depan."
          onChange={(event) => atur({ waktu: event.target.value })} onFocus={(event) => { event.currentTarget.max = waktuMaksimumWib(); }} />
        <Dropdown id="laporan-sumber" label="Sumber Laporan" ukuranLabel="ringkas" wajib value={informasi.sumber}
          error={error.sumber} placeholder="Pilih sumber laporan" pilihan={Object.entries(LABEL_SUMBER).map(([nilai, label]) => ({ nilai, label }))}
          onChange={(event) => atur({ sumber: event.target.value as InformasiLaporan["sumber"] })} />
        <Dropdown id="laporan-jenisSampah" label="Jenis Sampah" ukuranLabel="ringkas" wajib value={informasi.jenisSampah}
          error={error.jenisSampah} placeholder="Pilih jenis sampah" pilihan={Object.entries(LABEL_JENIS_SAMPAH).map(([nilai, label]) => ({ nilai, label }))}
          onChange={(event) => atur({ jenisSampah: event.target.value as InformasiLaporan["jenisSampah"] })} />
      </div>
    </div>
  );
}

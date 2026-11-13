"use client";

import { useEffect, useRef } from "react";
import { Textbox } from "@/components/ui";
import { waktuMinimumCleanIt, type ErrorInformasiCleanIt } from "@/lib/form-cleanit";
import type { InformasiLaporan } from "@/lib/form-laporan";
import { waktuMaksimumWib } from "@/lib/informasi-dasar";
import { MAKS_JUDUL } from "@/lib/judul";
import { formatWaktuLengkap } from "@/lib/laporan";
import { useFormLaporan } from "../FormLaporanProvider";

type Props = {
  waktuKejadianAsal: string;
  error: ErrorInformasiCleanIt;
  percobaan: number;
  onPerubahan: (informasi: InformasiLaporan) => void;
};

export function InformasiDasarCleanIt({ waktuKejadianAsal, error, percobaan, onPerubahan }: Props) {
  const { state, dispatch } = useFormLaporan();
  const { informasi, konfigurasi } = state;
  const ringkasan = useRef<HTMLDivElement>(null);
  const percobaanTerakhir = useRef(percobaan);
  const jumlahError = Object.keys(error).length;
  useEffect(() => {
    if (percobaanTerakhir.current === percobaan) return;
    percobaanTerakhir.current = percobaan;
    if (jumlahError) {
      ringkasan.current?.focus();
      ringkasan.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [percobaan, jumlahError]);

  function atur(perubahan: Partial<InformasiLaporan>) {
    dispatch({ tipe: "informasi", perubahan });
    onPerubahan({ ...informasi, ...perubahan });
  }

  return <div className="grid gap-4 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
    {jumlahError > 0 && <div ref={ringkasan} tabIndex={-1} role="alert" className="rounded-card border border-danger bg-danger-bg p-4 text-sm text-danger-text outline-none focus-visible:outline-2 focus-visible:outline-danger md:col-span-2">
      <p className="mb-2 font-semibold">Periksa kembali informasi pembersihan.</p>
      <ul className="list-inside list-disc space-y-1">{Object.entries(error).map(([field, pesan]) => <li key={field}>
        <button type="button" className="text-left underline underline-offset-2" onClick={(event) => event.currentTarget.form?.querySelector<HTMLElement>(`#laporan-${field}`)?.focus()}>{field === "judul" ? "Judul laporan" : "Waktu pembersihan"}: {pesan}</button>
      </li>)}</ul>
    </div>}
    <div className="min-w-0 md:col-span-2"><Textbox
      id="laporan-judul" label="Judul Laporan" ukuranLabel="ringkas" wajib maxLength={MAKS_JUDUL}
      value={informasi.judul} labelKanan={`${informasi.judul.length}/${MAKS_JUDUL}`} error={error.judul}
      placeholder="Contoh: Pembersihan Pantai Ancol"
      onChange={(event) => atur({ judul: event.target.value })} onBlur={() => atur({ judul: informasi.judul.trim() })}
    /></div>
    <section aria-label="Lokasi Pembersihan" className="min-w-0 space-y-2 rounded-card border border-border bg-white p-4 md:p-5">
      <h2 className="text-xs font-semibold md:text-sm">Lokasi Pembersihan</h2>
      <p className="break-words text-sm font-medium md:text-base">{konfigurasi.jenis === "CLEANIT" ? konfigurasi.namaLokasi : ""}</p>
      <p className="text-xs leading-relaxed text-text-secondary md:text-sm">Lokasi mengikuti pilihan Anda dari daftar Lokasi.</p>
    </section>
    <div className="min-w-0 space-y-3">
      <Textbox
        id="laporan-waktu" label="Waktu Pembersihan" ukuranLabel="ringkas" wajib type="datetime-local" step="any"
        min={waktuMinimumCleanIt(waktuKejadianAsal)} value={informasi.waktu} error={error.waktu}
        petunjuk="Tanggal dan waktu dalam WIB, sejak kejadian laporan asal hingga sekarang."
        onChange={(event) => atur({ waktu: event.target.value })}
        onFocus={(event) => { event.currentTarget.max = waktuMaksimumWib(); }}
      />
      <p className="text-xs leading-relaxed text-text-secondary">Waktu kejadian laporan asal: <time dateTime={waktuKejadianAsal}>{formatWaktuLengkap(waktuKejadianAsal)}</time></p>
    </div>
  </div>;
}

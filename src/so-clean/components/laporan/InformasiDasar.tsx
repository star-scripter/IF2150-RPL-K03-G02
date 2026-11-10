"use client";

import type { ReactNode } from "react";
import { Button, Dropdown, Textarea, Textbox } from "@/components/ui";
import { LABEL_JENIS_SAMPAH, LABEL_SUMBER, type InformasiLaporan } from "@/lib/form-laporan";
import { MAKS_JUDUL } from "@/lib/judul";
import { useFormLaporan } from "./FormLaporanProvider";
import { PratinjauLokasi } from "./VisualLaporan";

/** Isian terkendali untuk membuktikan persistensi state. Peta/validasi bisnis disediakan FE-10. */
export function InformasiDasar({ peta }: { peta?: ReactNode }) {
  const { state, dispatch } = useFormLaporan();
  const { informasi, konfigurasi } = state;
  function atur(perubahan: Partial<InformasiLaporan>) {
    dispatch({ tipe: "informasi", perubahan });
  }

  return (
    <div className="flex flex-col gap-4">
      <Textbox
        id="laporan-judul" label="Judul Laporan" ukuranLabel="ringkas" wajib
        value={informasi.judul} maxLength={MAKS_JUDUL}
        labelKanan={`${informasi.judul.length}/${MAKS_JUDUL}`}
        placeholder="Contoh: Sampah plastik di tepi sungai"
        onChange={(event) => atur({ judul: event.target.value })}
      />
      {konfigurasi.jenis === "REPORTIT" ? (
        <>
          <section aria-label="Lokasi Pencemaran" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold">Lokasi Pencemaran</h2>
            {peta ?? (
              <>
                <PratinjauLokasi />
                <Button varian="sekunder" disabled aria-describedby="status-peta">Pilih di peta</Button>
                <p id="status-peta" className="text-xs text-text-secondary">Pemilihan titik di peta belum tersedia.</p>
              </>
            )}
          </section>
          <Textarea
            id="laporan-lokasi" label="Alamat / Deskripsi Lokasi" ukuranLabel="ringkas" wajib rows={2}
            value={informasi.lokasi} maxLength={255}
            placeholder="Contoh: Pantai Ancol, Jakarta Utara"
            onChange={(event) => atur({ lokasi: event.target.value })}
          />
        </>
      ) : (
        <div className="rounded-card border border-border bg-white p-4 text-sm">
          <p className="mb-1 font-semibold text-dark-teal">Lokasi Pembersihan</p>
          <p className="break-words">{konfigurasi.namaLokasi}</p>
        </div>
      )}
      <Textbox
        id="laporan-waktu" label={konfigurasi.jenis === "CLEANIT" ? "Waktu Pembersihan" : "Waktu Kejadian"}
        ukuranLabel="ringkas" wajib type="datetime-local" value={informasi.waktu}
        petunjuk="Tanggal dan waktu dalam WIB."
        onChange={(event) => atur({ waktu: event.target.value })}
      />
      {konfigurasi.jenis === "REPORTIT" && (
        <>
          <Dropdown
            id="laporan-sumber" label="Sumber Laporan" ukuranLabel="ringkas" wajib
            value={informasi.sumber} placeholder="Pilih sumber laporan"
            pilihan={Object.entries(LABEL_SUMBER).map(([nilai, label]) => ({ nilai, label }))}
            onChange={(event) => atur({ sumber: event.target.value as InformasiLaporan["sumber"] })}
          />
          <Dropdown
            id="laporan-jenisSampah" label="Jenis Sampah" ukuranLabel="ringkas" wajib
            value={informasi.jenisSampah} placeholder="Pilih jenis sampah"
            pilihan={Object.entries(LABEL_JENIS_SAMPAH).map(([nilai, label]) => ({ nilai, label }))}
            onChange={(event) => atur({ jenisSampah: event.target.value as InformasiLaporan["jenisSampah"] })}
          />
        </>
      )}
    </div>
  );
}

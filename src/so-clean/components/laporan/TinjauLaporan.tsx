"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { LABEL_JENIS_SAMPAH, LABEL_SUMBER, formatWaktuLaporan, type BagianLaporan } from "@/lib/form-laporan";
import { useFormLaporan } from "./FormLaporanProvider";
import { PratinjauLokasi, IkonLaporan, PratinjauMedia } from "./VisualLaporan";
import { usePengirimanLaporan } from "./PengirimanLaporanProvider";

export function TinjauLaporan({ peta }: { peta?: ReactNode }) {
  const { state, dispatch } = useFormLaporan();
  const { mengirim, error } = usePengirimanLaporan();
  const { informasi, konfigurasi } = state;

  function pesanError(bagian: BagianLaporan) {
    return error?.bagian[bagian]?.map((pesan) => <p key={pesan} className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs leading-relaxed text-dark-teal">{pesan}</p>);
  }

  function ringkasan(judul: string, bagian: BagianLaporan, isi: ReactNode) {
    return (
      <Card className="gap-3 p-3.5 md:gap-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold text-dark-teal md:text-sm">{judul}</h2>
          <button
            type="button" aria-label={`Ubah ${judul}`} disabled={mengirim}
            onClick={() => { if (!mengirim) dispatch({ tipe: "ubah", bagian }); }}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-sky-blue/15 px-3 text-xs font-medium text-dark-teal hover:bg-sky-blue/30 focus-visible:outline-2 focus-visible:outline-dark-teal disabled:cursor-not-allowed disabled:opacity-50"
          ><IkonLaporan nama="ubah" className="size-3" />Ubah</button>
        </div>
        {isi}
        {pesanError(bagian)}
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5">
      <div className="flex min-w-0 flex-col gap-3 md:gap-5">
        {ringkasan("Judul Laporan", "judul", <p className="break-words text-sm text-text-secondary md:text-base">{informasi.judul || "Belum diisi"}</p>)}
        {konfigurasi.jenis === "REPORTIT" ? (
          ringkasan("Informasi Lokasi", "lokasi", (
            <div className="flex items-start gap-3">
              {peta ?? <PratinjauLokasi ringkas />}
              <div className="min-w-0 space-y-2 text-xs md:text-sm">
                <p className="break-words font-medium text-dark-teal">{informasi.lokasi || "Belum diisi"}</p>
                <p className="text-text-secondary">
                  {informasi.latitude !== null && informasi.longitude !== null
                    ? `${informasi.latitude.toFixed(6)}, ${informasi.longitude.toFixed(6)}`
                    : "Titik peta belum dipilih"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <Card className="p-3.5">
            <h2 className="text-xs font-semibold text-dark-teal">Lokasi Pembersihan</h2>
            <p className="break-words text-sm text-text-secondary">{konfigurasi.namaLokasi}</p>
            {pesanError("lokasi")}
          </Card>
        )}
        {ringkasan(konfigurasi.jenis === "CLEANIT" ? "Waktu Pembersihan" : "Waktu Kejadian", "waktu", (
          <p className="text-xs text-text-secondary md:text-sm">{formatWaktuLaporan(informasi.waktu)}</p>
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-3 md:gap-5">
        {konfigurasi.jenis === "REPORTIT" && (
          <>
            {ringkasan("Sumber Laporan", "sumber", <p className="text-xs text-text-secondary md:text-sm">{informasi.sumber ? LABEL_SUMBER[informasi.sumber] : "Belum diisi"}</p>)}
            {ringkasan("Jenis Sampah", "jenisSampah", <p className="text-xs text-text-secondary md:text-sm">{informasi.jenisSampah ? LABEL_JENIS_SAMPAH[informasi.jenisSampah] : "Belum diisi"}</p>)}
          </>
        )}
        {ringkasan("Bukti Media", "media", (
          state.media.length ? (
            <div className="grid grid-cols-3 gap-2">
              {state.media.map((media) => (
                <figure key={media.idLokal} className="min-w-0">
                  <PratinjauMedia media={media} ringkas />
                  <figcaption className="mt-1 truncate text-[10px] text-text-secondary md:text-xs" title={media.berkas.name}>{media.berkas.name}</figcaption>
                </figure>
              ))}
            </div>
          ) : <p className="text-xs text-text-secondary">Belum ada media dipilih.</p>
        ))}
      </div>
    </div>
  );
}

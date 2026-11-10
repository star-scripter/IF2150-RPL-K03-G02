"use client";

import { useSyncExternalStore } from "react";
import { useFormLaporan } from "./FormLaporanProvider";

function langgananStatusOnline(ubah: () => void) {
  window.addEventListener("online", ubah);
  window.addEventListener("offline", ubah);
  return () => {
    window.removeEventListener("online", ubah);
    window.removeEventListener("offline", ubah);
  };
}

/** `true` di server: banner offline hanya muncul setelah browser melaporkan offline. */
function useOnline(): boolean {
  return useSyncExternalStore(langgananStatusOnline, () => navigator.onLine, () => true);
}

const kelasBanner = "flex items-start gap-3 rounded-card p-3 text-xs leading-relaxed md:text-sm";

function IkonInfo({ className }: { className: string }) {
  return (
    <span aria-hidden className={`flex size-5 shrink-0 items-center justify-center rounded-full font-bold ${className}`}>
      !
    </span>
  );
}

/** Banner draf offline FE-13 (N5) di atas isi langkah form. */
export function PemberitahuanDraf() {
  const { state, draf } = useFormLaporan();
  const online = useOnline();
  const media = draf.mediaPerluDipilihUlang;

  if (online && media.length === 0 && !(draf.dipulihkan && state.langkah === 0)) return null;

  return (
    <div className="flex flex-col gap-2">
      {!online && (
        <div role="status" className={`${kelasBanner} bg-warning-bg text-warning-text`}>
          <IkonInfo className="bg-yellow text-white" />
          <p>
            <strong className="font-semibold">Anda sedang offline.</strong> Isian teks tetap tersimpan
            sebagai draf di perangkat ini. Laporan dapat dikirim setelah koneksi kembali.
          </p>
        </div>
      )}
      {media.length > 0 && (
        <div role="status" className={`${kelasBanner} bg-warning-bg text-warning-text`}>
          <IkonInfo className="bg-yellow text-white" />
          <p>
            <strong className="font-semibold">Pilih ulang media.</strong> Media yang dipilih
            sebelumnya ({media.join(", ")}) tidak ikut tersimpan karena halaman sempat ditutup.
            Pilih lagi di langkah Bukti Media.
          </p>
        </div>
      )}
      {draf.dipulihkan && state.langkah === 0 && (
        <div role="status" className={`${kelasBanner} items-center bg-sky-blue/15 text-dark-teal`}>
          <IkonInfo className="bg-sky-blue text-dark-teal" />
          <p className="flex-1">Isian dari draf sebelumnya sudah dipulihkan.</p>
          <button
            type="button" onClick={draf.buang}
            className="shrink-0 rounded-button px-2 py-1 font-semibold underline underline-offset-2 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-dark-teal"
          >
            Buang draf
          </button>
        </div>
      )}
    </div>
  );
}

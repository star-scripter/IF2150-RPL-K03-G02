"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import {
  buatStateFormLaporan,
  reducerFormLaporan,
  type AksiFormLaporan,
  type AwalFormLaporan,
  type StateFormLaporan,
} from "@/lib/form-laporan";
import { useDrafLaporan, type StatusDraf } from "./useDrafLaporan";

type KonteksFormLaporan = {
  state: StateFormLaporan;
  dispatch: Dispatch<AksiFormLaporan>;
  /** Draf offline FE-13; FE-12 memanggil `draf.hapus()` setelah laporan terkirim. */
  draf: StatusDraf;
};

const Konteks = createContext<KonteksFormLaporan | null>(null);

/** Satu provider untuk seluruh langkah; jangan pasang ulang provider di masing-masing step. */
export function FormLaporanProvider({
  awal,
  children,
}: {
  awal: AwalFormLaporan;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducerFormLaporan, awal, buatStateFormLaporan);
  const draf = useDrafLaporan(state, dispatch);
  return <Konteks.Provider value={{ state, dispatch, draf }}>{children}</Konteks.Provider>;
}

/** Titik integrasi FE-10/11/12/13/17, tanpa store global dan tanpa ketergantungan API. */
export function useFormLaporan() {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("useFormLaporan harus dipakai di dalam FormLaporanProvider.");
  return konteks;
}

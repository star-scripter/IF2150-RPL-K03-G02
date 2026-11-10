"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import {
  buatStateFormLaporan,
  reducerFormLaporan,
  type AksiFormLaporan,
  type AwalFormLaporan,
  type StateFormLaporan,
} from "@/lib/form-laporan";

type KonteksFormLaporan = {
  state: StateFormLaporan;
  dispatch: Dispatch<AksiFormLaporan>;
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
  return <Konteks.Provider value={{ state, dispatch }}>{children}</Konteks.Provider>;
}

/** Titik integrasi FE-10/11/12/13/17, tanpa store global dan tanpa ketergantungan API. */
export function useFormLaporan() {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("useFormLaporan harus dipakai di dalam FormLaporanProvider.");
  return konteks;
}

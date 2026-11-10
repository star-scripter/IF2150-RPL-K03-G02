"use client";

import { useState } from "react";
import { FormLaporan } from "../FormLaporan";
import { TinjauLaporan } from "../TinjauLaporan";
import { useFormLaporan } from "../FormLaporanProvider";
import { ambilKoordinat, validasiInformasiDasar, type ErrorInformasi } from "@/lib/informasi-dasar";
import { InformasiDasarReportIt } from "./InformasiDasarReportIt";
import { PetaLaporan } from "./PetaLaporan";

function PetaTinjauan() {
  const { state } = useFormLaporan();
  return <div className="h-28 w-32 shrink-0 md:h-40 md:w-40"><PetaLaporan koordinat={ambilKoordinat(state.informasi)} /></div>;
}

/** Menyambungkan FE-10 melalui slot/validasi FE-09; tidak mengubah alur media atau pengiriman. */
export function FormReportIt() {
  const [error, setError] = useState<ErrorInformasi>({});
  const [percobaan, setPercobaan] = useState(0);
  return <FormLaporan
    isiLangkah={{
      0: <InformasiDasarReportIt error={error} percobaan={percobaan} onPerubahan={(informasi) => {
        if (percobaan > 0) setError(validasiInformasiDasar(informasi).fields);
      }} />,
      2: <TinjauLaporan peta={<PetaTinjauan />} />,
    }}
    sebelumLanjut={{ 0: (state) => {
      const hasil = validasiInformasiDasar(state.informasi);
      setError(hasil.fields); setPercobaan((n) => n + 1);
      return hasil.valid;
    } }}
  />;
}

"use client";

import { useState } from "react";
import { FormLaporan } from "../FormLaporan";
import { TinjauLaporan } from "../TinjauLaporan";
import { useFormLaporan } from "../FormLaporanProvider";
import { ambilKoordinat, validasiInformasiDasar, type ErrorInformasi } from "@/lib/informasi-dasar";
import { InformasiDasarReportIt } from "./InformasiDasarReportIt";
import { PetaLaporan } from "./PetaLaporan";
import { KirimLaporan } from "../KirimLaporan";

function PetaTinjauan() {
  const { state } = useFormLaporan();
  return <div className="h-28 w-32 shrink-0 md:h-40 md:w-40"><PetaLaporan interaktif={false} koordinat={ambilKoordinat(state.informasi)} /></div>;
}

/** Menyambungkan informasi FE-10, media FE-11, dan pengiriman FE-12 melalui slot FE-09. */
export function FormReportIt() {
  const [error, setError] = useState<ErrorInformasi>({});
  const [percobaan, setPercobaan] = useState(0);
  return <FormLaporan
    aksiKirim={<KirimLaporan />}
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

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, Card, notify } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { lokasiApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { bacaDetailLokasi } from "@/lib/detail-lokasi";
import { validasiInformasiCleanIt, type ErrorInformasiCleanIt } from "@/lib/form-cleanit";
import { ROUTE } from "@/lib/nav";
import type { LokasiDetail } from "@/types/api";
import { FormLaporan } from "../FormLaporan";
import { KirimLaporan } from "../KirimLaporan";
import { InformasiDasarCleanIt } from "./InformasiDasarCleanIt";
import { MemuatFormCleanIt, StatusFormCleanIt } from "./StatusFormCleanIt";

/** N2: periksa lagi lokasi, termasuk akses langsung, refresh, dan kembali ke route tersimpan. */
export function FormCleanIt({ idLokasi }: { idLokasi: number | null }) {
  const router = useRouter();
  const [lokasi, setLokasi] = useState<LokasiDetail | null>(null);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [pesan, setPesan] = useState("");
  const [percobaan, setPercobaan] = useState(0);

  useLayoutEffect(() => () => { setStatus("memuat"); }, [idLokasi]);
  useEffect(() => {
    const pengendali = new AbortController();
    function alihkan(teks: string) { notify.info(teks, 8000); router.replace(ROUTE.lokasi); }
    async function muat() {
      // Batalkan effect percobaan Strict Mode sebelum memberi notifikasi/navigasi.
      await Promise.resolve();
      if (pengendali.signal.aborted) return;
      if (idLokasi === null) { alihkan("Pilih lokasi yang valid dari daftar Lokasi sebelum mengisi bukti pembersihan."); return; }
      try {
        const hasil = bacaDetailLokasi(await lokasiApi.detail(idLokasi, { signal: pengendali.signal }), idLokasi);
        if (pengendali.signal.aborted) return;
        if (hasil.status === "DIBERSIHKAN") { alihkan("Lokasi ini sudah dibersihkan. Pilih lokasi tercemar lain dari daftar Lokasi."); return; }
        setLokasi(hasil); setStatus("siap");
      } catch (error) {
        if (pengendali.signal.aborted) return;
        if (error instanceof ApiError && error.code === "NOT_FOUND") { alihkan("Lokasi pembersihan tidak ditemukan. Pilih lokasi lain dari daftar Lokasi."); return; }
        setPesan(error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR")); setStatus("gagal");
      }
    }
    void muat(); return () => pengendali.abort();
  }, [idLokasi, percobaan, router]);

  return <>
    {status === "memuat" && <MemuatFormCleanIt />}
    {status === "gagal" && <StatusFormCleanIt><Card role="alert" className="items-start">
      <h1 className="text-h2">Lokasi belum dapat diperiksa</h1>
      <p className="text-sm leading-relaxed text-text-secondary">{pesan}</p>
      <Button varian="sekunder" onClick={() => { setStatus("memuat"); setPercobaan((n) => n + 1); }}>Coba lagi</Button>
    </Card></StatusFormCleanIt>}
    {lokasi && <div hidden={status !== "siap"} inert={status !== "siap"} className={status === "siap" ? "flex flex-1 flex-col" : "hidden"}>
      {/* Simpan state/media saat Activity menyembunyikan route; form dikunci sampai GET terbaru valid. */}
      <FormLokasiTerverifikasi key={`${lokasi.idLokasi}:${lokasi.nama}:${lokasi.laporanAsal.waktu}`} lokasi={lokasi} />
    </div>}
  </>;
}

function FormLokasiTerverifikasi({ lokasi }: { lokasi: LokasiDetail }) {
  const [error, setError] = useState<ErrorInformasiCleanIt>({});
  const [percobaan, setPercobaan] = useState(0);
  return <FormLaporan
    awal={{ konfigurasi: { jenis: "CLEANIT", lokasiId: lokasi.idLokasi, namaLokasi: lokasi.nama, waktuKejadianAsal: lokasi.laporanAsal.waktu } }}
    aksiKirim={<KirimLaporan />}
    isiLangkah={{ 0: <InformasiDasarCleanIt waktuKejadianAsal={lokasi.laporanAsal.waktu} error={error} percobaan={percobaan}
      onPerubahan={(informasi) => { if (percobaan > 0) setError(validasiInformasiCleanIt(informasi, lokasi.laporanAsal.waktu).fields); }} /> }}
    sebelumLanjut={{ 0: (state) => {
      const hasil = validasiInformasiCleanIt(state.informasi, lokasi.laporanAsal.waktu);
      setError(hasil.fields); setPercobaan((n) => n + 1); return hasil.valid;
    } }}
  />;
}

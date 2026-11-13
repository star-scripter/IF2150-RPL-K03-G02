"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { notify } from "@/components/ui/toast-store";
import { ApiError } from "@/lib/api/client";
import { laporanApi } from "@/lib/api/endpoints";
import { hasilKirimValid, kegagalanKirimLaporan, siapkanKirimLaporan, type KegagalanKirim } from "@/lib/kirim-laporan";
import { formatIdLaporan } from "@/lib/laporan";
import { useFormLaporan } from "./FormLaporanProvider";
import { useUnggahMedia } from "./UnggahMediaProvider";

type KonteksPengiriman = { mengirim: boolean; error: KegagalanKirim | null; kirim: () => Promise<void> };
const Konteks = createContext<KonteksPengiriman | null>(null);

/** Tetap hidup saat Ubah → Simpan; error tidak menghapus state/ID unggahan FE-09/11. */
export function PengirimanLaporanProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, draf } = useFormLaporan();
  const { memilih } = useUnggahMedia();
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState<KegagalanKirim | null>(null);
  const aktif = useRef<AbortController | null>(null);

  useEffect(() => () => {
    const pengendali = aktif.current;
    aktif.current = null; pengendali?.abort();
    // Activity mempertahankan state route. Buka kunci saat kembali setelah request dibatalkan.
    setMengirim(false);
  }, []);

  async function kirim() {
    // Ref mengunci langsung, termasuk beberapa klik sebelum React merender ulang.
    if (aktif.current || state.langkah !== 2) return;
    // Pemilihan File dapat sedang menunggu pemeriksaan kuota FE-11.
    if (memilih) { setError({ pesan: "Tunggu hingga pemilihan bukti selesai sebelum mengirim.", bagian: { media: ["Bukti baru masih disiapkan. Periksa kembali bukti sebelum mengirim."] } }); return; }
    const persiapan = siapkanKirimLaporan(state);
    if (!persiapan.valid) { setError(persiapan.error); return; }
    const pengendali = new AbortController();
    aktif.current = pengendali; setMengirim(true); setError(null);
    try {
      const hasil = await laporanApi.buat(persiapan.payload, { signal: pengendali.signal });
      if (aktif.current !== pengendali) return;
      if (!hasilKirimValid(hasil)) throw new ApiError("INTERNAL_ERROR", 200);
      // Hapus penyimpanan dahulu agar effect autosave tidak menulis ulang draf lama.
      draf.hapus(); dispatch({ tipe: "reset" });
      notify.sukses(`Laporan berhasil dikirim · ${formatIdLaporan(hasil.idLaporan)} · Menunggu pemeriksaan`, 0);
    } catch (penyebab) {
      if (aktif.current === pengendali && !pengendali.signal.aborted) setError(kegagalanKirimLaporan(penyebab));
    } finally {
      if (aktif.current === pengendali) { aktif.current = null; setMengirim(false); }
    }
  }
  return <Konteks.Provider value={{ mengirim, error, kirim }}>{children}</Konteks.Provider>;
}

export function usePengirimanLaporan() {
  const nilai = useContext(Konteks);
  if (!nilai) throw new Error("usePengirimanLaporan harus dipakai di dalam PengirimanLaporanProvider.");
  return nilai;
}

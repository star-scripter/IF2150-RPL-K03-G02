"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { notify } from "@/components/ui/toast-store";
import { mediaApi } from "@/lib/api/endpoints";
import { AntreanMedia, type SnapshotUnggahan } from "@/lib/antrean-media";
import { periksaKuotaMedia, pesanGagalMedia, validasiPilihanMedia } from "@/lib/bukti-media";
import { useFormLaporan } from "./FormLaporanProvider";

type KonteksUnggah = {
  status: SnapshotUnggahan;
  online: boolean;
  memilih: boolean;
  pesan: string;
  pilih: (files: File[]) => Promise<void>;
  hapus: (id: string) => void;
  cobaLagi: (id: string) => void;
};
const Konteks = createContext<KonteksUnggah | null>(null);
function langgananOnline(ubah: () => void) {
  window.addEventListener("online", ubah); window.addEventListener("offline", ubah);
  return () => { window.removeEventListener("online", ubah); window.removeEventListener("offline", ubah); };
}

/** Dipasang sekali di bawah FE-09; berpindah langkah tidak mematikan antrean FE-11. */
export function UnggahMediaProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useFormLaporan();
  const [antrean] = useState(() => new AntreanMedia({
    unggah: (file, opsi) => mediaApi.upload(file, opsi),
    berhasil: (idLokal, unggahan) => dispatch({ tipe: "media-terunggah", idLokal, unggahan }),
    gagal: (pesan) => notify.gagal(pesan),
  }));
  const status = useSyncExternalStore(antrean.langganan, antrean.ambilSnapshot, antrean.ambilSnapshotServer);
  const online = useSyncExternalStore(langgananOnline, () => navigator.onLine, () => true);
  const [memilih, setMemilih] = useState(false);
  const [pesan, setPesan] = useState("");
  const pilihan = useRef(state.media);
  const sedangMemilih = useRef(false);
  const hidup = useRef(true);
  const generasi = useRef(0);

  useLayoutEffect(() => {
    // Termasuk reset dari Buang draf FE-13: unggahan yang tidak lagi dipilih dibatalkan.
    if (pilihan.current.length > 0 && state.media.length === 0) generasi.current += 1;
    pilihan.current = state.media;
    antrean.sinkronkan(state.media);
  }, [antrean, state.media]);

  useEffect(() => {
    hidup.current = true;
    antrean.aktifkan(navigator.onLine);
    const ubah = () => antrean.setOnline(navigator.onLine);
    window.addEventListener("online", ubah); window.addEventListener("offline", ubah);
    return () => {
      hidup.current = false; generasi.current += 1;
      window.removeEventListener("online", ubah); window.removeEventListener("offline", ubah);
      antrean.nonaktifkan();
    };
  }, [antrean]);

  async function pilih(files: File[]) {
    if (!files.length || sedangMemilih.current) return;
    sedangMemilih.current = true; setMemilih(true);
    const giliran = generasi.current;
    try {
      const salah = validasiPilihanMedia(files, pilihan.current.length);
      if (salah) throw new Error(salah);
      await periksaKuotaMedia(files.reduce((total, file) => total + file.size, 0));
      if (!hidup.current || giliran !== generasi.current) return;
      const periksaLagi = validasiPilihanMedia(files, pilihan.current.length);
      if (periksaLagi) throw new Error(periksaLagi);
      // Pastikan browser bisa membuat pratinjau sebelum File masuk ke draf/antrean.
      for (const file of files) { const url = URL.createObjectURL(file); URL.revokeObjectURL(url); }
      const media = files.map((berkas) => ({ idLokal: crypto.randomUUID(), berkas, unggahan: null }));
      pilihan.current = [...pilihan.current, ...media];
      dispatch({ tipe: "tambah-media", media }); setPesan("");
    } catch (error) {
      if (hidup.current && giliran === generasi.current) {
        const teks = error instanceof Error && error.name === "Error" ? error.message : pesanGagalMedia(error);
        setPesan(teks); notify.gagal(`Gagal menambahkan media: ${teks}`);
      }
    } finally {
      sedangMemilih.current = false;
      if (hidup.current) setMemilih(false);
    }
  }

  function hapus(idLokal: string) {
    antrean.hapus(idLokal);
    pilihan.current = pilihan.current.filter((item) => item.idLokal !== idLokal);
    dispatch({ tipe: "hapus-media", idLokal }); setPesan("");
  }
  return <Konteks.Provider value={{ status, online, memilih, pesan, pilih, hapus, cobaLagi: (id) => antrean.cobaLagi(id) }}>{children}</Konteks.Provider>;
}

export function useUnggahMedia() {
  const nilai = useContext(Konteks);
  if (!nilai) throw new Error("useUnggahMedia harus dipakai di dalam UnggahMediaProvider.");
  return nilai;
}

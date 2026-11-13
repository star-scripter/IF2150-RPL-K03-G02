"use client";

import { useCallback, useEffect, useReducer, useRef, type Dispatch } from "react";
import {
  bacaDraf,
  drafDariState,
  hapusDraf,
  isFormKosong,
  kunciDraf,
  simpanDraf,
} from "@/lib/draf-laporan";
import type { AksiFormLaporan, StateFormLaporan } from "@/lib/form-laporan";

export type StatusDraf = {
  /** Isian dipulihkan dari draf kunjungan sebelumnya. */
  dipulihkan: boolean;
  /** Nama media dari draf yang berkasnya hilang karena tab sempat ditutup (N5). */
  mediaPerluDipilihUlang: readonly string[];
  /**
   * Hapus draf dan berhenti menyimpan sampai form dikosongkan (`reset`). FE-12 memanggil ini
   * setelah laporan berhasil terkirim.
   */
  hapus: () => void;
  /** Buang draf yang dipulihkan dan mulai dari form kosong. */
  buang: () => void;
};

type Pemulihan = { dipulihkan: boolean; namaMedia: readonly string[] };
const TANPA_PEMULIHAN: Pemulihan = { dipulihkan: false, namaMedia: [] };

/**
 * Draf offline FE-13: memulihkan isian teks sekali saat form dibuka, lalu menyimpannya setiap
 * kali state berubah. Pemulihan dilakukan setelah mount karena `localStorage` tidak ada di server.
 */
export function useDrafLaporan(
  state: StateFormLaporan,
  dispatch: Dispatch<AksiFormLaporan>,
): StatusDraf {
  const kunci = kunciDraf(state.konfigurasi);
  // Reducer, bukan useState: pemulihan dari localStorage memang harus diterapkan di effect
  // setelah hidrasi, bersamaan dengan dispatch isian form (satu render tambahan).
  const [pemulihan, setPemulihan] = useReducer(
    (_lama: Pemulihan, baru: Pemulihan) => baru,
    TANPA_PEMULIHAN,
  );
  /** Form pernah berisi; setelah itu form kosong berarti draf perlu dihapus. */
  const pernahTerisi = useRef(false);
  /** Setelah `hapus()`, jangan simpan lagi sampai form di-reset. */
  const ditahan = useRef(false);

  useEffect(() => {
    // Effect simpan berjalan juga saat mount dengan state awal yang kosong. Form kosong yang
    // belum pernah terisi tidak menyentuh penyimpanan, jadi draf belum terhapus sebelum dipulihkan.
    const kosong = isFormKosong(state);
    if (ditahan.current) {
      if (kosong) ditahan.current = false;
      return;
    }
    if (kosong) {
      if (pernahTerisi.current) hapusDraf(kunci);
      return;
    }
    pernahTerisi.current = true;
    simpanDraf(kunci, drafDariState(state, pemulihan.namaMedia));
  }, [kunci, state, pemulihan.namaMedia]);

  useEffect(() => {
    const draf = bacaDraf(kunci);
    if (!draf) return;
    dispatch({ tipe: "informasi", perubahan: draf.informasi });
    setPemulihan({ dipulihkan: true, namaMedia: draf.namaMedia });
  }, [kunci, dispatch]);

  const hapus = useCallback(() => {
    ditahan.current = true;
    hapusDraf(kunci);
    setPemulihan(TANPA_PEMULIHAN);
  }, [kunci]);

  const buang = useCallback(() => {
    hapus();
    dispatch({ tipe: "reset" });
  }, [hapus, dispatch]);

  return {
    dipulihkan: pemulihan.dipulihkan,
    mediaPerluDipilihUlang: state.media.length === 0 ? pemulihan.namaMedia : [],
    hapus,
    buang,
  };
}

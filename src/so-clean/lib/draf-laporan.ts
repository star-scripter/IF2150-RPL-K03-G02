/**
 * Draf offline form laporan (FE-13, N5).
 *
 * Hanya isian teks yang disimpan di `localStorage`; berkas media tidak ikut karena bisa sampai
 * 20 MB dan melebihi kuota. Yang dicatat hanya nama media, supaya form bisa meminta pengguna
 * memilih ulang media jika tab sempat ditutup.
 *
 * Semua fungsi menerima `penyimpanan` agar bisa diuji tanpa browser; nilai bawaannya
 * `localStorage`. Kegagalan penyimpanan (kuota penuh, mode privat, dll.) tidak melempar error.
 */
import { z } from "zod";
import {
  LABEL_JENIS_SAMPAH,
  LABEL_SUMBER,
  MAKS_MEDIA_LAPORAN,
  buatStateFormLaporan,
  type InformasiLaporan,
  type KonfigurasiFormLaporan,
  type StateFormLaporan,
} from "./form-laporan";
import type { JenisSampah, Sumber } from "../types/api";

const AWALAN_KUNCI = "soclean:draf-laporan";

/** Bagian `Storage` yang dipakai draf. */
export type PenyimpananDraf = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type DrafLaporan = {
  versi: 1;
  informasi: InformasiLaporan;
  /** Nama media yang sudah dipilih; berkasnya sendiri tidak disimpan. */
  namaMedia: string[];
  /** ISO UTC. */
  disimpanPada: string;
};

const NILAI_SUMBER = Object.keys(LABEL_SUMBER) as Sumber[];
const NILAI_JENIS_SAMPAH = Object.keys(LABEL_JENIS_SAMPAH) as JenisSampah[];

/** Isi localStorage bisa diubah atau rusak; draf yang tidak sesuai bentuk ini dibuang. */
const skemaDraf = z.object({
  versi: z.literal(1),
  informasi: z.object({
    judul: z.string(),
    lokasi: z.string(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    waktu: z.string(),
    sumber: z.enum(["", ...NILAI_SUMBER]),
    jenisSampah: z.enum(["", ...NILAI_JENIS_SAMPAH]),
  }),
  namaMedia: z.array(z.string()).max(MAKS_MEDIA_LAPORAN),
  disimpanPada: z.string(),
});

/** Satu draf per jenis form: ReportIt, dan CleanIt per lokasi. */
export function kunciDraf(konfigurasi: KonfigurasiFormLaporan): string {
  return konfigurasi.jenis === "CLEANIT"
    ? `${AWALAN_KUNCI}:cleanit:${konfigurasi.lokasiId}`
    : `${AWALAN_KUNCI}:reportit`;
}

/** `localStorage` jika tersedia; aksesnya sendiri bisa melempar error (mis. cookie diblokir). */
export function penyimpananBrowser(): PenyimpananDraf | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Form dianggap kosong jika isiannya masih sama dengan isian awal dan belum ada media. */
export function isFormKosong(state: StateFormLaporan): boolean {
  if (state.media.length > 0) return false;
  const awal = buatStateFormLaporan({ konfigurasi: state.konfigurasi }).informasi;
  return (Object.keys(awal) as (keyof InformasiLaporan)[]).every(
    (kunci) => state.informasi[kunci] === awal[kunci],
  );
}

/**
 * Draf dari state form. `namaMediaTertunda` dipakai selama media hasil pemulihan belum dipilih
 * ulang, agar catatan media tidak hilang jika tab ditutup lagi.
 */
export function drafDariState(
  state: StateFormLaporan,
  namaMediaTertunda: readonly string[] = [],
  sekarang: Date = new Date(),
): DrafLaporan {
  return {
    versi: 1,
    informasi: { ...state.informasi },
    namaMedia:
      state.media.length > 0 ? state.media.map((item) => item.berkas.name) : [...namaMediaTertunda],
    disimpanPada: sekarang.toISOString(),
  };
}

/** Simpan draf; `false` jika penyimpanan tidak tersedia atau penuh. */
export function simpanDraf(
  kunci: string,
  draf: DrafLaporan,
  penyimpanan: PenyimpananDraf | null = penyimpananBrowser(),
): boolean {
  if (!penyimpanan) return false;
  try {
    penyimpanan.setItem(kunci, JSON.stringify(draf));
    return true;
  } catch {
    return false;
  }
}

/** Baca draf; draf rusak atau dari versi lain dihapus dan dianggap tidak ada. */
export function bacaDraf(
  kunci: string,
  penyimpanan: PenyimpananDraf | null = penyimpananBrowser(),
): DrafLaporan | null {
  if (!penyimpanan) return null;
  let teks: string | null;
  try {
    teks = penyimpanan.getItem(kunci);
  } catch {
    return null;
  }
  if (teks === null) return null;

  let json: unknown;
  try {
    json = JSON.parse(teks);
  } catch {
    json = null;
  }
  const hasil = skemaDraf.safeParse(json);
  if (!hasil.success) {
    hapusDraf(kunci, penyimpanan);
    return null;
  }
  return hasil.data;
}

export function hapusDraf(
  kunci: string,
  penyimpanan: PenyimpananDraf | null = penyimpananBrowser(),
): void {
  try {
    penyimpanan?.removeItem(kunci);
  } catch {
    // Penyimpanan tidak tersedia: tidak ada draf yang perlu dihapus.
  }
}

/**
 * State form I-11 ↔ I-12 ↔ I-13 (FE-09).
 * Tidak mengunggah/mengirim data atau menyimpan draf. File hanya hidup di memori form.
 */
import type { JenisSampah, MediaUploadResponse, Sumber } from "@/types/api";
import { buatJudulCleanIt } from "@/lib/judul";

export const LANGKAH_LAPORAN = ["Informasi Dasar", "Bukti Media", "Tinjau & Kirim"] as const;
export const MAKS_MEDIA_LAPORAN = 3;
export const MAKS_UKURAN_MEDIA = 20 * 1024 * 1024;

export type LangkahLaporan = 0 | 1 | 2;
export type BagianLaporan = "judul" | "lokasi" | "waktu" | "sumber" | "jenisSampah" | "media";

export type KonfigurasiFormLaporan =
  | { jenis: "REPORTIT" }
  | {
    jenis: "CLEANIT";
    lokasiId: number;
    namaLokasi: string;
    /** FE-17 mengisi dari detail BE-17, bukan dari draf atau input pengguna. */
    waktuKejadianAsal?: string;
  };

export type InformasiLaporan = {
  judul: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  /** Nilai datetime-local dalam WIB. Konversi ke ISO UTC dilakukan saat mengirim (FE-12). */
  waktu: string;
  sumber: Sumber | "";
  jenisSampah: JenisSampah | "";
};

export type MediaFormLaporan = {
  idLokal: string;
  berkas: File;
  /** Diisi FE-11 setelah upload; tetap tersimpan ketika langkah berganti. */
  unggahan: MediaUploadResponse | null;
};

export type StateFormLaporan = {
  konfigurasi: KonfigurasiFormLaporan;
  langkah: LangkahLaporan;
  informasi: InformasiLaporan;
  media: readonly MediaFormLaporan[];
  /** Bagian yang dituju tombol Ubah; juga dipakai untuk mengarahkan fokus. */
  bagianDiedit: BagianLaporan | null;
};

export type AwalFormLaporan = {
  konfigurasi: KonfigurasiFormLaporan;
  informasi?: Partial<InformasiLaporan>;
};

export function buatStateFormLaporan({ konfigurasi, informasi }: AwalFormLaporan): StateFormLaporan {
  return {
    konfigurasi: { ...konfigurasi },
    langkah: 0,
    informasi: {
      judul: konfigurasi.jenis === "CLEANIT" ? buatJudulCleanIt(konfigurasi.namaLokasi) : "",
      lokasi: "",
      latitude: null,
      longitude: null,
      waktu: "",
      sumber: "",
      jenisSampah: "",
      ...informasi,
    },
    media: [],
    bagianDiedit: null,
  };
}

export type AksiFormLaporan =
  | { tipe: "informasi"; perubahan: Partial<InformasiLaporan> }
  | { tipe: "tambah-media"; media: readonly MediaFormLaporan[] }
  | { tipe: "hapus-media"; idLokal: string }
  | { tipe: "media-terunggah"; idLokal: string; unggahan: MediaUploadResponse }
  | { tipe: "lanjut" }
  | { tipe: "kembali" }
  | { tipe: "ubah"; bagian: BagianLaporan }
  | { tipe: "reset" };

export function reducerFormLaporan(state: StateFormLaporan, aksi: AksiFormLaporan): StateFormLaporan {
  switch (aksi.tipe) {
    case "informasi":
      return { ...state, informasi: { ...state.informasi, ...aksi.perubahan } };
    case "tambah-media": {
      const idTerpakai = new Set(state.media.map((item) => item.idLokal));
      const tambahan = aksi.media.filter((item) => {
        if (idTerpakai.has(item.idLokal)) return false;
        idTerpakai.add(item.idLokal);
        return true;
      });
      return { ...state, media: [...state.media, ...tambahan].slice(0, MAKS_MEDIA_LAPORAN) };
    }
    case "hapus-media":
      return { ...state, media: state.media.filter((item) => item.idLokal !== aksi.idLokal) };
    case "media-terunggah":
      return {
        ...state,
        media: state.media.map((item) =>
          item.idLokal === aksi.idLokal ? { ...item, unggahan: aksi.unggahan } : item,
        ),
      };
    case "lanjut":
      return {
        ...state,
        langkah: state.bagianDiedit ? 2 : ((Math.min(2, state.langkah + 1)) as LangkahLaporan),
        bagianDiedit: null,
      };
    case "kembali":
      return {
        ...state,
        langkah: state.bagianDiedit ? 2 : ((Math.max(0, state.langkah - 1)) as LangkahLaporan),
        bagianDiedit: null,
      };
    case "ubah":
      return { ...state, langkah: aksi.bagian === "media" ? 1 : 0, bagianDiedit: aksi.bagian };
    case "reset":
      return buatStateFormLaporan({ konfigurasi: state.konfigurasi });
  }
}

export const LABEL_SUMBER: Record<Sumber, string> = {
  PENGAMATAN_PRIBADI: "Pengamatan pribadi",
  INFO_WARGA: "Info warga",
  MEDIA_SOSIAL: "Media sosial",
  LAINNYA: "Lainnya",
};

export const LABEL_JENIS_SAMPAH: Record<JenisSampah, string> = {
  PLASTIK: "Plastik",
  KEMASAN_STYROFOAM: "Kemasan styrofoam",
  RUMAH_TANGGA: "Rumah tangga",
  ORGANIK: "Organik",
  LAINNYA: "Lainnya",
};

/** Tidak bergantung zona waktu perangkat pengguna. */
export function formatWaktuLaporan(waktu: string): string {
  if (!waktu) return "Belum diisi";
  const tanggal = new Date(`${waktu}+07:00`);
  if (Number.isNaN(tanggal.getTime())) return "Waktu tidak valid";
  return `${new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(tanggal)} WIB`;
}

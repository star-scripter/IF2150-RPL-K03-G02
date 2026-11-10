import type { KodeErrorKlien } from "@/lib/api/pesan-error";
import type { TukarPoinResponse } from "@/types/api";

export type TindakanGagalTukar = {
  tutup: boolean;
  muatUlang: boolean;
};

// N12: POIN_TIDAK_CUKUP, STOK_HABIS, dan NOT_FOUND berarti saldo atau stok di I-04 sudah basi,
// jadi sheet ditutup dan daftar dimuat ulang. Error lain (INTERNAL_ERROR karena rollback,
// JARINGAN) membiarkan sheet tetap terbuka agar pengguna bisa mencoba lagi.
export function tindakanGagalTukar(code: KodeErrorKlien): TindakanGagalTukar {
  switch (code) {
    case "POIN_TIDAK_CUKUP":
    case "STOK_HABIS":
    case "NOT_FOUND":
      return { tutup: true, muatUlang: true };
    default:
      return { tutup: false, muatUlang: false };
  }
}

// Hasil penukaran yang dibaca I-06 dari sessionStorage bisa diubah pengguna, jadi bentuknya
// divalidasi; data rusak = tidak ada data.
export function uraiHasilPenukaran(mentah: string | null): TukarPoinResponse | null {
  if (!mentah) return null;
  let data: unknown;
  try {
    data = JSON.parse(mentah);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const h = data as Partial<Record<keyof TukarPoinResponse, unknown>>;
  if (
    typeof h.idPenukaran !== "string" ||
    h.idPenukaran === "" ||
    typeof h.namaReward !== "string" ||
    typeof h.kodeVoucher !== "string" ||
    h.kodeVoucher === "" ||
    typeof h.poinDipakai !== "number" ||
    !Number.isFinite(h.poinDipakai) ||
    typeof h.sisaPoin !== "number" ||
    !Number.isFinite(h.sisaPoin) ||
    typeof h.waktuPenukaran !== "string" ||
    Number.isNaN(Date.parse(h.waktuPenukaran))
  ) {
    return null;
  }
  return {
    idPenukaran: h.idPenukaran,
    namaReward: h.namaReward,
    kodeVoucher: h.kodeVoucher,
    poinDipakai: h.poinDipakai,
    waktuPenukaran: h.waktuPenukaran,
    sisaPoin: h.sisaPoin,
  };
}

const FORMAT_WAKTU = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function formatWaktuPenukaran(iso: string): string {
  return FORMAT_WAKTU.format(new Date(iso));
}

// idPenukaran berupa UUID; layar cukup menampilkan 8 karakter pertama (UUID lengkap di `title`).
export function formatIdPenukaran(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// Riwayat memakai limit default BE-22 (10, maks 50).
export const LIMIT_RIWAYAT = 10;

// BE-22 menolak page > 1.000.000 dengan FORMAT_TIDAK_VALID.
const HALAMAN_MAKS = 1_000_000;

// `?page=` bisa diketik pengguna; selain bilangan bulat 1..HALAMAN_MAKS dianggap halaman 1.
export function bacaHalaman(param: string | null): number {
  if (!param || !/^\d+$/.test(param)) return 1;
  const n = Number(param);
  return n >= 1 && n <= HALAMAN_MAKS ? n : 1;
}

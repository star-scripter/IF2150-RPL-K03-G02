import type { KodeErrorKlien } from "@/lib/api/pesan-error";

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

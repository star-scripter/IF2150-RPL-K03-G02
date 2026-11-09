import { describe, expect, it } from "vitest";
import { tindakanGagalTukar } from "../lib/penukaran";

describe("tindakanGagalTukar", () => {
  it.each(["POIN_TIDAK_CUKUP", "STOK_HABIS", "NOT_FOUND"] as const)(
    "%s menutup sheet dan memuat ulang daftar",
    (code) => {
      expect(tindakanGagalTukar(code)).toEqual({ tutup: true, muatUlang: true });
    },
  );

  it.each(["INTERNAL_ERROR", "JARINGAN"] as const)("%s membiarkan sheet terbuka", (code) => {
    expect(tindakanGagalTukar(code)).toEqual({ tutup: false, muatUlang: false });
  });
});

import { describe, expect, it } from "vitest";
import {
  bacaHalaman,
  formatIdPenukaran,
  formatWaktuPenukaran,
  tindakanGagalTukar,
  uraiHasilPenukaran,
} from "../lib/penukaran";

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

const HASIL = {
  idPenukaran: "3f2a9c1e-7b4d-4e2a-9c1e-3f2a9c1e7b4d",
  namaReward: "Stiker SoClean",
  kodeVoucher: "SC-7KQM-X4TD",
  poinDipakai: 20,
  waktuPenukaran: "2026-10-28T03:24:00.000Z",
  sisaPoin: 47,
};

describe("uraiHasilPenukaran", () => {
  it("mengembalikan hasil yang bentuknya valid", () => {
    expect(uraiHasilPenukaran(JSON.stringify(HASIL))).toEqual(HASIL);
  });

  it("membuang field di luar TukarPoinResponse", () => {
    expect(uraiHasilPenukaran(JSON.stringify({ ...HASIL, lain: 1 }))).toEqual(HASIL);
  });

  it.each([
    ["kosong", null],
    ["bukan JSON", "{rusak"],
    ["bukan objek", "42"],
    ["field hilang", JSON.stringify({ ...HASIL, kodeVoucher: undefined })],
    ["tipe salah", JSON.stringify({ ...HASIL, sisaPoin: "47" })],
    ["waktu tidak valid", JSON.stringify({ ...HASIL, waktuPenukaran: "kemarin" })],
  ])("%s → null", (_, mentah) => {
    expect(uraiHasilPenukaran(mentah)).toBeNull();
  });
});

describe("format tampilan I-06", () => {
  it("waktu ditampilkan dalam WIB format id-ID", () => {
    expect(formatWaktuPenukaran("2026-10-28T03:24:00Z")).toBe("28 Okt 2026, 10.24");
  });

  it("ID penukaran dipendekkan menjadi 8 karakter huruf besar", () => {
    expect(formatIdPenukaran(HASIL.idPenukaran)).toBe("3F2A9C1E");
  });
});

describe("bacaHalaman", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["15", 15],
    ["1000000", 1_000_000],
  ])("'%s' dibaca sebagai halaman %i", (param, hasil) => {
    expect(bacaHalaman(param)).toBe(hasil);
  });

  it.each([null, "", "0", "-1", "1.5", "abc", "2a", " 2", "1e3", "1000001"])(
    "%s dianggap halaman 1",
    (param) => {
      expect(bacaHalaman(param)).toBe(1);
    },
  );
});

import { describe, expect, it } from "vitest";
import {
  bacaFilterValidasi,
  formatIdLaporan,
  formatWaktuKirim,
  formatWaktuLengkap,
  urlValidasi,
} from "../lib/laporan";

describe("formatIdLaporan", () => {
  it.each([
    [248, "RPT-0248"],
    [7, "RPT-0007"],
    [12345, "RPT-12345"],
  ])("%i → %s", (id, hasil) => {
    expect(formatIdLaporan(id)).toBe(hasil);
  });
});

function param(query: string) {
  return new URLSearchParams(query);
}

describe("bacaFilterValidasi", () => {
  it("tanpa query → ReportIt, terbaru, halaman 1", () => {
    expect(bacaFilterValidasi(param(""))).toEqual({ jenis: "REPORTIT", sort: "terbaru", page: 1 });
  });

  it("membaca tab CleanIt, urutan terlama, dan halaman", () => {
    expect(bacaFilterValidasi(param("jenis=cleanit&sort=terlama&page=3"))).toEqual({
      jenis: "CLEANIT",
      sort: "terlama",
      page: 3,
    });
  });

  it("nilai tidak dikenal jatuh ke default", () => {
    expect(bacaFilterValidasi(param("jenis=CLEANIT&sort=acak"))).toEqual({
      jenis: "REPORTIT",
      sort: "terbaru",
      page: 1,
    });
  });

  it.each(["0", "-1", "abc", "1.5", "2e3", "", "1000001"])("page=%s dianggap halaman 1", (page) => {
    expect(bacaFilterValidasi(param(`page=${page}`)).page).toBe(1);
  });

  it("page maksimum 1.000.000 diterima", () => {
    expect(bacaFilterValidasi(param("page=1000000")).page).toBe(1_000_000);
  });
});

describe("urlValidasi", () => {
  it("nilai default tidak ditulis", () => {
    expect(urlValidasi({ jenis: "REPORTIT", sort: "terbaru", page: 1 })).toBe("/operator/laporan");
  });

  it("menulis tab, urutan, dan halaman", () => {
    expect(urlValidasi({ jenis: "CLEANIT", sort: "terlama", page: 2 })).toBe(
      "/operator/laporan?jenis=cleanit&sort=terlama&page=2",
    );
  });

  it("hasilnya terbaca kembali menjadi filter yang sama", () => {
    const filter = { jenis: "CLEANIT", sort: "terbaru", page: 4 } as const;
    const query = urlValidasi(filter).split("?")[1];
    expect(bacaFilterValidasi(param(query))).toEqual(filter);
  });
});

describe("formatWaktuKirim", () => {
  const sekarang = Date.parse("2026-11-10T05:00:00Z");
  const lalu = (ms: number) => new Date(sekarang - ms).toISOString();
  const MENIT = 60_000;

  it.each([
    [0, "Baru saja"],
    [59_000, "Baru saja"],
    [MENIT, "1 menit lalu"],
    [15 * MENIT, "15 menit lalu"],
    [60 * MENIT, "1 jam lalu"],
    [23 * 60 * MENIT + 59 * MENIT, "23 jam lalu"],
    [24 * 60 * MENIT, "1 hari lalu"],
    [6 * 24 * 60 * MENIT, "6 hari lalu"],
  ])("selisih %i ms → %s", (ms, hasil) => {
    expect(formatWaktuKirim(lalu(ms), sekarang)).toBe(hasil);
  });

  it("7 hari atau lebih ditulis tanggal WIB", () => {
    // 2026-10-28T20:24Z = 29 Okt 2026 03.24 WIB
    expect(formatWaktuKirim("2026-10-28T20:24:00Z", sekarang)).toBe("29 Okt 2026");
  });

  it("waktu sedikit di masa depan tidak menghasilkan angka negatif", () => {
    expect(formatWaktuKirim(new Date(sekarang + 30_000).toISOString(), sekarang)).toBe("Baru saja");
  });
});

describe("formatWaktuLengkap", () => {
  it("tanggal panjang dan jam WIB seperti mockup I-08", () => {
    expect(formatWaktuLengkap("2023-10-14T03:45:00Z")).toBe("14 Oktober 2023, 10.45 WIB");
  });
});

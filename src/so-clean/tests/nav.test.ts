/** Navigasi FE-03: penentuan menu aktif dan konsistensi daftar menu. */
import { describe, expect, it } from "vitest";
import { NAV_MASYARAKAT, NAV_OPERATOR, ROUTE, isNavAktif } from "../lib/nav";

describe("isNavAktif", () => {
  it("aktif untuk route itu sendiri", () => {
    expect(isNavAktif("/lokasi", ROUTE.lokasi)).toBe(true);
    expect(isNavAktif("/operator/laporan", ROUTE.operatorLaporan)).toBe(true);
  });

  it("aktif untuk route turunan", () => {
    expect(isNavAktif("/lokasi/12", ROUTE.lokasi)).toBe(true);
    expect(isNavAktif("/hadiah/riwayat", ROUTE.hadiah)).toBe(true);
  });

  it("mengabaikan garis miring di akhir", () => {
    expect(isNavAktif("/profil/", ROUTE.profil)).toBe(true);
  });

  it("tidak aktif untuk route lain atau awalan yang hanya mirip", () => {
    expect(isNavAktif("/beranda", ROUTE.lokasi)).toBe(false);
    expect(isNavAktif("/lokasiku", ROUTE.lokasi)).toBe(false);
    expect(isNavAktif("/cleanit/3", ROUTE.lokasi)).toBe(false);
    expect(isNavAktif("/operator/profil", ROUTE.operatorLaporan)).toBe(false);
  });

  it("tidak aktif jika pathname belum diketahui (fallback Suspense)", () => {
    expect(isNavAktif(null, ROUTE.beranda)).toBe(false);
    expect(isNavAktif(undefined, ROUTE.beranda)).toBe(false);
    expect(isNavAktif("", ROUTE.beranda)).toBe(false);
  });
});

describe("daftar menu", () => {
  it("bottom nav Masyarakat berurutan Home, Lokasi, Hadiah, Profil sesuai Figma", () => {
    expect(NAV_MASYARAKAT.map((m) => [m.label, m.href])).toEqual([
      ["Home", "/beranda"],
      ["Lokasi", "/lokasi"],
      ["Hadiah", "/hadiah"],
      ["Profil", "/profil"],
    ]);
  });

  it("paling banyak satu menu aktif untuk setiap route", () => {
    const semua = [...NAV_MASYARAKAT, ...NAV_OPERATOR];
    for (const route of Object.values(ROUTE)) {
      const aktif = semua.filter((m) => isNavAktif(route, m.href));
      expect(aktif.length).toBeLessThanOrEqual(1);
    }
  });
});

/** Aturan akses halaman sesuai role (FE-05). */
import { describe, expect, it } from "vitest";
import { aturanHalaman, halamanAwal } from "../lib/akses";
import { ROUTE } from "../lib/nav";

const LANJUT = { aksi: "lanjut" };
const ke = (tujuan: string) => ({ aksi: "alihkan", ke: tujuan });

describe("halamanAwal", () => {
  it("Masyarakat ke Beranda (I-03), Operator ke validasi laporan (I-07)", () => {
    expect(halamanAwal("MASYARAKAT")).toBe(ROUTE.beranda);
    expect(halamanAwal("OPERATOR")).toBe(ROUTE.operatorLaporan);
  });
});

describe("aturanHalaman: tamu", () => {
  it("boleh membuka Login dan Register", () => {
    expect(aturanHalaman("/login", null)).toEqual(LANJUT);
    expect(aturanHalaman("/register", null)).toEqual(LANJUT);
  });

  it("diarahkan ke Login untuk halaman lain, termasuk `/`", () => {
    for (const path of ["/", "/beranda", "/lokasi/12", "/operator/laporan", "/design"]) {
      expect(aturanHalaman(path, null), path).toEqual(ke(ROUTE.login));
    }
  });
});

describe("aturanHalaman: sudah login", () => {
  it("`/`, Login, dan Register diarahkan ke halaman awal role", () => {
    for (const path of ["/", "/login", "/register"]) {
      expect(aturanHalaman(path, "MASYARAKAT"), path).toEqual(ke(ROUTE.beranda));
      expect(aturanHalaman(path, "OPERATOR"), path).toEqual(ke(ROUTE.operatorLaporan));
    }
  });

  it("Masyarakat boleh membuka halaman Masyarakat dan route turunannya", () => {
    for (const path of ["/beranda", "/lokasi", "/lokasi/12", "/hadiah/riwayat", "/profil", "/reportit", "/cleanit/3"]) {
      expect(aturanHalaman(path, "MASYARAKAT"), path).toEqual(LANJUT);
    }
  });

  it("Masyarakat tidak boleh membuka halaman Operator", () => {
    expect(aturanHalaman("/operator/laporan", "MASYARAKAT")).toEqual(ke(ROUTE.beranda));
    expect(aturanHalaman("/operator", "MASYARAKAT")).toEqual(ke(ROUTE.beranda));
  });

  it("Operator boleh membuka halaman Operator", () => {
    expect(aturanHalaman("/operator/laporan", "OPERATOR")).toEqual(LANJUT);
    expect(aturanHalaman("/operator/profil", "OPERATOR")).toEqual(LANJUT);
  });

  it("Operator tidak boleh membuka halaman Masyarakat", () => {
    for (const path of ["/beranda", "/lokasi/12", "/hadiah", "/profil", "/reportit", "/cleanit/3"]) {
      expect(aturanHalaman(path, "OPERATOR"), path).toEqual(ke(ROUTE.operatorLaporan));
    }
  });

  it("awalan yang hanya mirip tidak dianggap route yang sama", () => {
    // `/berandaku` bukan turunan `/beranda`; `/operatorx` bukan turunan `/operator`.
    expect(aturanHalaman("/berandaku", "OPERATOR")).toEqual(LANJUT);
    expect(aturanHalaman("/operatorx", "MASYARAKAT")).toEqual(LANJUT);
  });

  it("halaman umum (mis. /design) boleh dibuka role mana pun", () => {
    expect(aturanHalaman("/design", "MASYARAKAT")).toEqual(LANJUT);
    expect(aturanHalaman("/design", "OPERATOR")).toEqual(LANJUT);
  });

  it("tujuan pengalihan tidak pernah dialihkan lagi (tanpa loop)", () => {
    for (const role of ["MASYARAKAT", "OPERATOR"] as const) {
      expect(aturanHalaman(halamanAwal(role), role)).toEqual(LANJUT);
    }
    expect(aturanHalaman(ROUTE.login, null)).toEqual(LANJUT);
  });
});

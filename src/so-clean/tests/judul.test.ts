import { describe, expect, it } from "vitest";
import { MAKS_JUDUL, buatJudulCleanIt, potongJudul } from "../lib/judul";

describe("potongJudul", () => {
  it("membiarkan judul yang sudah pendek", () => {
    expect(potongJudul("Laporan sungai")).toBe("Laporan sungai");
  });

  it("membuang spasi di awal dan akhir", () => {
    expect(potongJudul("  Laporan sungai  ")).toBe("Laporan sungai");
  });

  it("tidak memotong judul tepat 80 karakter", () => {
    const judul = "a".repeat(MAKS_JUDUL);
    expect(potongJudul(judul)).toBe(judul);
  });

  it("memotong judul lebih dari 80 karakter dan menambahkan elipsis", () => {
    const hasil = potongJudul("a".repeat(MAKS_JUDUL + 1));
    expect(hasil).toBe(`${"a".repeat(MAKS_JUDUL - 1)}…`);
    expect(Array.from(hasil)).toHaveLength(MAKS_JUDUL);
  });

  it("tidak memecah pasangan surrogate (emoji)", () => {
    const hasil = potongJudul("😀".repeat(MAKS_JUDUL + 1));
    expect(hasil).toBe(`${"😀".repeat(MAKS_JUDUL - 1)}…`);
    expect(Array.from(hasil)).toHaveLength(MAKS_JUDUL);
  });

  it("menangani batas maks yang sangat kecil", () => {
    expect(potongJudul("abc", 0)).toBe("");
    expect(potongJudul("abc", 1)).toBe("…");
    expect(potongJudul("abc", 2)).toBe("a…");
  });
});

describe("buatJudulCleanIt", () => {
  it("membuat judul default dari nama lokasi", () => {
    expect(buatJudulCleanIt("Sungai Cikapundung")).toBe(
      "Pembersihan Sungai Cikapundung",
    );
  });

  it("memangkas spasi di tepi nama lokasi", () => {
    expect(buatJudulCleanIt("  Pantai Ancol  ")).toBe("Pembersihan Pantai Ancol");
  });

  it("tidak memotong judul yang tepat 80 karakter", () => {
    const nama = "x".repeat(68); // 12 + 68 = 80
    const hasil = buatJudulCleanIt(nama);
    expect(hasil).toBe(`Pembersihan ${nama}`);
    expect(hasil).toHaveLength(MAKS_JUDUL);
  });

  it("memotong nama lokasi 255 karakter agar judul tetap 80 karakter", () => {
    const hasil = buatJudulCleanIt("x".repeat(255));
    expect(hasil.startsWith("Pembersihan ")).toBe(true);
    expect(hasil.endsWith("…")).toBe(true);
    expect(Array.from(hasil)).toHaveLength(MAKS_JUDUL);
  });
});

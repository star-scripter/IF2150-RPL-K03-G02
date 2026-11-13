import { describe, expect, it } from "vitest";
import { diDalamWilayah, WILAYAH } from "@/lib/wilayah";

describe("wilayah kerja sama (K10)", () => {
  it("menyediakan tiga wilayah dari kontrak final", () => {
    expect(WILAYAH.map(({ kode }) => kode)).toEqual(["CIKAPUNDUNG", "ANCOL", "PANGANDARAN"]);
    expect(diDalamWilayah(-6.885, 107.6065)).toBe(true);
    expect(diDalamWilayah(-6.12, 106.84)).toBe(true);
    expect(diDalamWilayah(-7.7, 108.65)).toBe(true);
  });

  it("memperlakukan keempat tepi bounding box sebagai inklusif", () => {
    const cikapundung = WILAYAH[0]!;
    expect(diDalamWilayah(cikapundung.latMin, cikapundung.lngMin)).toBe(true);
    expect(diDalamWilayah(cikapundung.latMax, cikapundung.lngMax)).toBe(true);
    expect(diDalamWilayah(cikapundung.latMin - 0.000001, cikapundung.lngMin)).toBe(false);
    expect(diDalamWilayah(cikapundung.latMax, cikapundung.lngMax + 0.000001)).toBe(false);
  });
});

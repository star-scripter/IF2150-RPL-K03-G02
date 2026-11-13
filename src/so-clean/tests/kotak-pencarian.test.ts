import { beforeEach, describe, expect, it } from "vitest";
import { RADIUS_GABUNG_METER, cariTerdekatTercemar, kotakPencarian } from "@/server/models/lokasi";
import { DATABASE_TEST_AKTIF, buatLokasi, buatPengguna, kosongkanDatabase } from "./helpers/db";

const R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Titik tujuan berjarak `jarak` meter dari (lat, lng) dengan arah `arah` derajat (bola). */
function tujuan(lat: number, lng: number, jarak: number, arah: number): [number, number] {
  const d = jarak / R;
  const φ1 = rad(lat);
  const θ = rad(arah);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ));
  const λ2 = rad(lng) + Math.atan2(Math.sin(θ) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2));
  return [deg(φ2), deg(λ2)];
}

describe("kotakPencarian (prefilter radius 50 m, BE-26)", () => {
  it("memuat semua titik tepat 50 m di berbagai lintang dan arah", () => {
    for (const lat of [-60, -7.7, -6.885, -6.12, 0, 25, 60]) {
      const lng = 107.6065;
      const kotak = kotakPencarian(lat, lng);
      for (let arah = 0; arah < 360; arah += 7.5) {
        const [la, ln] = tujuan(lat, lng, RADIUS_GABUNG_METER, arah);
        expect(la).toBeGreaterThanOrEqual(kotak.latMin);
        expect(la).toBeLessThanOrEqual(kotak.latMax);
        expect(ln).toBeGreaterThanOrEqual(kotak.lngMin!);
        expect(ln).toBeLessThanOrEqual(kotak.lngMax!);
      }
    }
  });

  it("tetap sempit (±0,1% dari batas minimal) agar index efektif", () => {
    const kotak = kotakPencarian(-6.885, 107.6065);
    const dLatMinimal = deg(RADIUS_GABUNG_METER / R);
    expect(kotak.latMax - -6.885).toBeCloseTo(dLatMinimal * 1.001, 12);
  });

  it("tidak memfilter longitude di dekat kutub atau garis ±180°", () => {
    expect(kotakPencarian(89.9999, 10)).toMatchObject({ lngMin: null, lngMax: null });
    expect(kotakPencarian(0, 179.99999)).toMatchObject({ lngMin: null, lngMax: null });
    expect(kotakPencarian(0, -179.99999)).toMatchObject({ lngMin: null, lngMax: null });
  });
});

describe.runIf(DATABASE_TEST_AKTIF)("cariTerdekatTercemar arah timur–barat (BE-26)", () => {
  beforeEach(async () => {
    await kosongkanDatabase();
  });

  it("batas 50 m tetap inklusif ke arah timur dan barat", async () => {
    const pelapor = (await buatPengguna()).id;
    const operator = (await buatPengguna({ role: "OPERATOR" })).id;
    const { idLokasi } = await buatLokasi({ pelapor, operator, latitude: -6.885, longitude: 107.6065 });

    for (const arah of [90, 270]) {
      const [latDekat, lngDekat] = tujuan(-6.885, 107.6065, 49.9, arah);
      const [latJauh, lngJauh] = tujuan(-6.885, 107.6065, 50.1, arah);
      await expect(cariTerdekatTercemar(latDekat, lngDekat)).resolves.toMatchObject({ idLokasi });
      await expect(cariTerdekatTercemar(latJauh, lngJauh)).resolves.toBeNull();
    }
  });
});

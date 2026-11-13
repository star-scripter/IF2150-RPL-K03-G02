import { beforeEach, describe, expect, it } from "vitest";
import { hitungBersihkanSendiri30Hari } from "@/server/models/laporan";
import {
  RADIUS_GABUNG_METER,
  cariTerdekatTercemar,
  getPelaporAsal,
  getRingkasanByIds,
} from "@/server/models/lokasi";
import { getByLaporan } from "@/server/models/media";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatMedia,
  buatPengguna,
  kosongkanDatabase,
} from "./helpers/db";

/** Haversine yang sama dengan seed dan mock FE-04, untuk membandingkan hasil SQL. */
function jarakMeter(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
}

const LAT = -6.885;
const LNG = 107.6065;
const HARI = 24 * 60 * 60 * 1000;

describe.runIf(DATABASE_TEST_AKTIF)("model untuk daftar/detail laporan (BE-12)", () => {
  let pelapor: string;
  let operator: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    pelapor = (await buatPengguna()).id;
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
  });

  describe("cariTerdekatTercemar (K13)", () => {
    it("mengembalikan lokasi TERCEMAR dalam radius 50 m beserta jaraknya", async () => {
      const { idLokasi } = await buatLokasi({ pelapor, operator, nama: "Bantaran" });
      const lat = LAT + 0.00027; // ±30 m ke utara

      const hasil = await cariTerdekatTercemar(lat, LNG);

      expect(hasil).toMatchObject({ idLokasi, nama: "Bantaran" });
      expect(hasil!.jarakMeter).toBeCloseTo(jarakMeter(lat, LNG, LAT, LNG), 3);
    });

    it("memakai batas inklusif 50 m: ±49 m digabung, ±51 m tidak", async () => {
      await buatLokasi({ pelapor, operator });
      const dekat = LAT + 0.00044;
      const jauh = LAT + 0.000459;
      expect(jarakMeter(dekat, LNG, LAT, LNG)).toBeLessThanOrEqual(RADIUS_GABUNG_METER);
      expect(jarakMeter(jauh, LNG, LAT, LNG)).toBeGreaterThan(RADIUS_GABUNG_METER);

      await expect(cariTerdekatTercemar(dekat, LNG)).resolves.not.toBeNull();
      await expect(cariTerdekatTercemar(jauh, LNG)).resolves.toBeNull();
    });

    it("memilih yang terdekat dan mengabaikan lokasi DIBERSIHKAN", async () => {
      await buatLokasi({ pelapor, operator, nama: "Bersih", status: "DIBERSIHKAN" });
      await buatLokasi({ pelapor, operator, nama: "Agak jauh", latitude: LAT + 0.0003 });
      const dekat = await buatLokasi({ pelapor, operator, nama: "Dekat", latitude: LAT + 0.0001 });

      const hasil = await cariTerdekatTercemar(LAT, LNG);
      expect(hasil).toMatchObject({ idLokasi: dekat.idLokasi, nama: "Dekat" });
    });
  });

  it("getRingkasanByIds mengembalikan nama, koordinat, dan jenis sampah per lokasi", async () => {
    const a = await buatLokasi({ pelapor, operator, nama: "A", jenisSampah: "ORGANIK" });
    const b = await buatLokasi({ pelapor, operator, nama: "B", latitude: -6.12, longitude: 106.83 });

    const peta = await getRingkasanByIds([a.idLokasi, b.idLokasi, 999]);

    expect(peta.size).toBe(2);
    expect(peta.get(a.idLokasi)).toEqual({ nama: "A", latitude: LAT, longitude: LNG, jenisSampah: "ORGANIK" });
    expect(peta.get(b.idLokasi)).toMatchObject({ nama: "B", latitude: -6.12, longitude: 106.83 });
    await expect(getRingkasanByIds([])).resolves.toEqual(new Map());
  });

  it("getPelaporAsal mengembalikan pelapor laporan asal, atau null", async () => {
    const { idLokasi } = await buatLokasi({ pelapor, operator });
    await expect(getPelaporAsal(idLokasi)).resolves.toBe(pelapor);
    await expect(getPelaporAsal(999)).resolves.toBeNull();
  });

  it("getByLaporan hanya mengembalikan media laporan itu, urut ID", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    const pertama = await buatMedia({ idPengguna: pelapor, laporanId: idLaporan });
    const kedua = await buatMedia({ idPengguna: pelapor, laporanId: idLaporan, tipe: "VIDEO" });
    await buatMedia({ idPengguna: pelapor, laporanId: null });

    const hasil = await getByLaporan(idLaporan);
    expect(hasil.map((m) => [m.idMedia, m.tipe, m.storageKey])).toEqual([
      [pertama.idMedia, "FOTO", pertama.storageKey],
      [kedua.idMedia, "VIDEO", kedua.storageKey],
    ]);
  });

  it("hitungBersihkanSendiri30Hari hanya menghitung CleanIt di lokasi laporannya sendiri, 30 hari terakhir", async () => {
    const lain = (await buatPengguna()).id;
    const milikSendiri = await buatLokasi({ pelapor, operator });
    const milikSendiri2 = await buatLokasi({ pelapor, operator, latitude: LAT + 0.001 });
    const milikLain = await buatLokasi({ pelapor: lain, operator, latitude: LAT + 0.002 });

    const ini = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: milikSendiri.idLokasi });
    // Dihitung: lokasi sendiri yang lain, status apa pun, masih dalam 30 hari.
    await buatLaporan({
      jenis: "CLEANIT",
      idPengguna: pelapor,
      lokasiId: milikSendiri2.idLokasi,
      status: "TIDAK_VALID",
      alasanPenolakan: "Foto buram",
      diverifikasiOleh: operator,
      createdAt: new Date(Date.now() - 29 * HARI),
    });
    // Tidak dihitung: lebih dari 30 hari, lokasi milik orang lain, dan CleanIt milik orang lain.
    await buatLaporan({
      jenis: "CLEANIT",
      idPengguna: pelapor,
      lokasiId: milikSendiri2.idLokasi,
      status: "VALID",
      diverifikasiOleh: operator,
      createdAt: new Date(Date.now() - 31 * HARI),
    });
    await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: milikLain.idLokasi });
    await buatLaporan({ jenis: "CLEANIT", idPengguna: lain, lokasiId: milikSendiri.idLokasi });

    await expect(hitungBersihkanSendiri30Hari(pelapor, ini.idLaporan)).resolves.toBe(1);
    await expect(hitungBersihkanSendiri30Hari(lain, 0)).resolves.toBe(0);
  });
});

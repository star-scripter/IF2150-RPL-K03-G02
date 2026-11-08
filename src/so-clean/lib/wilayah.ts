/**
 * Wilayah kerja sama SoClean — K10.
 *
 * Sumber: docs/contracts/SoClean — Pembagian Tugas FE & BE v0.6.md,
 * bagian "Wilayah kerja sama (K10)".
 *
 * Batas berupa bounding box lat/lng. Dipakai bersama FE dan BE; file ini
 * tidak boleh mengimpor dari `server/` atau mengakses database.
 *
 * Batas inklusif: titik tepat di tepi kotak dianggap di dalam wilayah.
 * Ini aturan bisnis, bukan pengaman — koordinat tetap bisa diedit pengguna.
 *
 * Jangan ubah nilai di bawah tanpa memperbarui kontrak v0.6 (K10) di PR
 * yang sama.
 */

export type KodeWilayah = "CIKAPUNDUNG" | "ANCOL" | "PANGANDARAN";

export type Wilayah = {
  readonly kode: KodeWilayah;
  readonly nama: string;
  readonly latMin: number;
  readonly latMax: number;
  readonly lngMin: number;
  readonly lngMax: number;
};

const DATA_WILAYAH = [
  {
    kode: "CIKAPUNDUNG",
    nama: "Sungai Cikapundung (Zona Teras Cikapundung), Bandung",
    latMin: -6.893000,
    latMax: -6.878028,
    lngMin: 107.605000,
    lngMax: 107.608809,
  },
  {
    kode: "ANCOL",
    nama: "Pantai Ancol, Jakarta Utara",
    latMin: -6.135000,
    latMax: -6.110000,
    lngMin: 106.815000,
    lngMax: 106.870000,
  },
  {
    kode: "PANGANDARAN",
    nama: "Pantai Pangandaran",
    latMin: -7.725000,
    latMax: -7.670000,
    lngMin: 108.630000,
    lngMax: 108.680000,
  },
] as const satisfies readonly Wilayah[];

/** Daftar wilayah, dibekukan agar tidak bisa diubah saat runtime. */
export const WILAYAH: readonly Wilayah[] = Object.freeze(
  DATA_WILAYAH.map((wilayah) => Object.freeze(wilayah)),
);

/** true jika (lat, lng) berada di dalam salah satu wilayah kerja sama. */
export function diDalamWilayah(lat: number, lng: number): boolean {
  return WILAYAH.some(
    (wilayah) =>
      lat >= wilayah.latMin &&
      lat <= wilayah.latMax &&
      lng >= wilayah.lngMin &&
      lng <= wilayah.lngMax,
  );
}
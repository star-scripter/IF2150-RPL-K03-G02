/** Paritas format FE-10 dengan BE-10; tidak ada koneksi/query database dalam pemeriksaan ini. */
import { describe, expect, it } from "vitest";
import { is_format_valid, is_terisi } from "../server/controllers/manager-laporan";
import { validasiInformasiDasar, waktuWibKeIso } from "../lib/informasi-dasar";
import type { InformasiLaporan } from "../lib/form-laporan";

const sekarang = new Date("2026-11-10T03:00:00Z");
const awal: InformasiLaporan = {
  judul: "Sampah di tepi sungai", lokasi: "Teras Cikapundung", latitude: -6.885, longitude: 107.607,
  waktu: "2026-11-08T14:30", sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK",
};

describe("format informasi FE-10 mengikuti BE-10", () => {
  it.each([
    ["normal", {}],
    ["judul kosong", { judul: " " }],
    ["judul terlalu panjang", { judul: "a".repeat(81) }],
    ["alamat kosong", { lokasi: "" }],
    ["alamat terlalu panjang", { lokasi: "a".repeat(256) }],
    ["latitude kosong", { latitude: null }],
    ["longitude kosong", { longitude: null }],
    ["koordinat nol", { latitude: 0, longitude: 0 }],
    ["latitude di luar rentang", { latitude: 91 }],
    ["longitude di luar rentang", { longitude: -181 }],
    ["latitude string", { latitude: "-6.885" }],
    ["sumber salah", { sumber: "ASAL_SAMPAH" }],
    ["jenis sampah salah", { jenisSampah: "KACA" }],
    ["waktu kosong", { waktu: "" }],
    ["waktu masa depan", { waktu: "2026-11-10T10:01" }],
    ["waktu tepat sekarang", { waktu: "2026-11-10T10:00" }],
  ] as const)("paritas kelengkapan dan format: %s", (_, patch) => {
    const informasi = { ...awal, ...patch } as InformasiLaporan;
    const body = { ...informasi, jenis: "REPORTIT", idMedia: [1], waktu: informasi.waktu ? waktuWibKeIso(informasi.waktu) ?? "tidak-valid" : "" };
    const hasil = validasiInformasiDasar(informasi, sekarang);
    expect(hasil.valid).toBe(is_format_valid(body, sekarang));
    expect(hasil.code === "DATA_TIDAK_LENGKAP").toBe(!is_terisi(body));
  });
});

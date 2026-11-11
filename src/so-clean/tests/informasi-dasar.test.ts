import { describe, expect, it } from "vitest";
import { ambilKoordinat, bacaKoordinat, diLuarWilayah, koordinatValid, pesanKegagalanGps, rapikanKoordinat, validasiInformasiDasar, waktuMaksimumWib, waktuWibKeIso, wilayahTitik } from "../lib/informasi-dasar";
import type { InformasiLaporan } from "../lib/form-laporan";
import { buatStateFormLaporan, reducerFormLaporan } from "../lib/form-laporan";
import { WILAYAH } from "../lib/wilayah";

const sekarang = new Date("2026-11-10T03:00:00Z");
const informasi: InformasiLaporan = {
  judul: "Sampah di Cikapundung", lokasi: "Tepi Sungai Cikapundung, Bandung",
  latitude: -6.885, longitude: 107.607, waktu: "2026-11-08T14:30",
  sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK",
};

describe("validasi informasi dasar FE-10", () => {
  it("menerima seluruh field I11 tanpa membutuhkan media atau endpoint BE", () => {
    expect(validasiInformasiDasar(informasi, sekarang)).toEqual({ valid: true, code: null, fields: {} });
  });
  it("membedakan data belum lengkap dan format salah", () => {
    const kosong = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }).informasi;
    const hasil = validasiInformasiDasar(kosong, sekarang);
    expect(hasil.code).toBe("DATA_TIDAK_LENGKAP");
    expect(Object.keys(hasil.fields).sort()).toEqual(["judul", "lokasi", "koordinat", "waktu", "sumber", "jenisSampah"].sort());
    expect(validasiInformasiDasar({ ...informasi, latitude: NaN }, sekarang).code).toBe("FORMAT_TIDAK_VALID");
  });
  it.each(["judul", "lokasi", "waktu", "sumber", "jenisSampah"] as const)("menolak %s yang hanya berisi spasi", (field) => {
    expect(validasiInformasiDasar({ ...informasi, [field]: "   " }, sekarang).fields[field]).toBeDefined();
    expect(validasiInformasiDasar({ ...informasi, [field]: "   " }, sekarang).code).toBe("DATA_TIDAK_LENGKAP");
  });
  it("batas teks mengikuti trim serta panjang judul/alamat BE", () => {
    expect(validasiInformasiDasar({ ...informasi, judul: "a".repeat(80), lokasi: "a".repeat(255) }, sekarang).valid).toBe(true);
    expect(validasiInformasiDasar({ ...informasi, judul: "a".repeat(81) }, sekarang).fields.judul).toBeDefined();
    expect(validasiInformasiDasar({ ...informasi, lokasi: "a".repeat(256) }, sekarang).fields.lokasi).toBeDefined();
    expect(validasiInformasiDasar({ ...informasi, judul: ` ${"a".repeat(80)} ` }, sekarang).valid).toBe(true);
  });
  it("menolak enum yang tidak tersedia", () => {
    const rusak = { ...informasi, sumber: "SUMBER_PENCEMARAN", jenisSampah: "KACA" } as unknown as InformasiLaporan;
    const hasil = validasiInformasiDasar(rusak, sekarang);
    expect(hasil.code).toBe("FORMAT_TIDAK_VALID");
    expect(hasil.fields.sumber).toBeDefined(); expect(hasil.fields.jenisSampah).toBeDefined();
  });
  it("menolak waktu masa depan dan menerima waktu tepat sekarang", () => {
    expect(validasiInformasiDasar({ ...informasi, waktu: "2026-11-10T10:00" }, sekarang).valid).toBe(true);
    expect(validasiInformasiDasar({ ...informasi, waktu: "2026-11-10T10:01" }, sekarang).fields.waktu).toContain("masa depan");
  });
  it("menolak koordinat parsial tanpa menganggap nol sebagai kosong", () => {
    expect(validasiInformasiDasar({ ...informasi, latitude: null }, sekarang).code).toBe("DATA_TIDAK_LENGKAP");
    expect(validasiInformasiDasar({ ...informasi, latitude: 0, longitude: 0 }, sekarang).valid).toBe(true);
  });
  it("validasi gagal tidak memodifikasi data FE-09 maupun file yang sudah dipilih", () => {
    const berkas = new File(["png"], "bukti.png", { type: "image/png" });
    let state = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" }, informasi });
    state = reducerFormLaporan(state, { tipe: "tambah-media", media: [{ idLokal: "bukti", berkas, unggahan: null }] });
    state = reducerFormLaporan(state, { tipe: "informasi", perubahan: { lokasi: "" } });
    const hasil = validasiInformasiDasar(state.informasi, sekarang);
    expect(hasil.valid).toBe(false);
    expect(state.media[0].berkas).toBe(berkas);
    expect(state.informasi.judul).toBe(informasi.judul);
    expect(state.informasi.lokasi).toBe("");
  });
});

describe("waktu lokal WIB → UTC", () => {
  it.each([
    ["2026-11-08T00:30", "2026-11-07T17:30:00.000Z"],
    ["2026-11-08T23:59", "2026-11-08T16:59:00.000Z"],
    ["2024-02-29T10:00", "2024-02-29T03:00:00.000Z"],
    ["2026-11-08T14:30:15.12", "2026-11-08T07:30:15.120Z"],
  ])("mengonversi %s tanpa mengikuti zona waktu perangkat", (input, output) => expect(waktuWibKeIso(input)).toBe(output));
  it.each(["", "2026-02-29T10:00", "2026-02-31T10:00", "2026-13-01T10:00", "2026-11-08T24:00", "2026-11-08T12:60", "2026-11-08", "2026-11-08T10:00Z", "0000-01-01T10:00"])("menolak kalender/format tidak valid: %s", (input) => expect(waktuWibKeIso(input)).toBeNull());
  it("batas date picker menggunakan WIB di sekitar pergantian tanggal", () => {
    expect(waktuMaksimumWib(new Date("2026-11-08T18:05:00Z"))).toBe("2026-11-09T01:05");
  });
});

describe("koordinat dan peringatan wilayah", () => {
  it.each([[0, 0], [-90, -180], [90, 180], [-6.885, 107.607]])("menerima batas/angka sah %s, %s", (lat, lng) => expect(koordinatValid(lat, lng)).toBe(true));
  it.each([[null, 0], [undefined, 0], [NaN, 0], [0, Infinity], [-90.01, 0], [0, 180.01], ["-6.885", "107.607"]])("menolak koordinat tidak valid %s, %s", (lat, lng) => expect(koordinatValid(lat, lng)).toBe(false));
  it("isian koordinat kosong bukan nol dan angka parsial tidak dianggap titik", () => {
    expect(bacaKoordinat("", "")).toBeNull(); expect(bacaKoordinat("  ", "107.6")).toBeNull();
    expect(bacaKoordinat("0", "0")).toEqual({ latitude: 0, longitude: 0 });
    expect(bacaKoordinat("-6.885", "107.607")).toEqual({ latitude: -6.885, longitude: 107.607 });
    expect(ambilKoordinat({ latitude: null, longitude: 107.6 })).toBeNull();
  });
  it("klik pada salinan dunia dan presisi GPS diselaraskan dengan rentang API", () => {
    expect(rapikanKoordinat(-6.885123456, 467.607)).toEqual({ latitude: -6.885123, longitude: 107.607 });
    expect(rapikanKoordinat(0, -540).longitude).toBe(-180);
  });
  it.each(WILAYAH)("menggunakan batas inklusif wilayah $kode", (w) => {
    const point = { latitude: w.latMin, longitude: w.lngMax };
    expect(wilayahTitik(point)?.kode).toBe(w.kode);
    expect(diLuarWilayah(point)).toBe(false);
  });
  it("di luar wilayah adalah peringatan terpisah dari pemeriksaan format", () => {
    expect(diLuarWilayah(null)).toBe(false);
    expect(diLuarWilayah({ latitude: 0, longitude: 0 })).toBe(true);
    expect(validasiInformasiDasar({ ...informasi, latitude: 0, longitude: 0 }, sekarang).valid).toBe(true);
  });
  it.each([1, 2, 3, 0])("menyediakan pesan GPS %s dan cara memilih lokasi pengganti", (code) => {
    expect(pesanKegagalanGps(code)).toMatch(/peta/);
  });
});

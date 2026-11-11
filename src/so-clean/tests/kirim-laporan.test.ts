import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/client";
import { reducerFormLaporan } from "@/lib/form-laporan";
import { hasilKirimValid, kegagalanKirimLaporan, siapkanKirimLaporan } from "@/lib/kirim-laporan";
import { formatIdLaporan } from "@/lib/laporan";
import { formTerisi } from "./helpers/form-terisi";

const sekarang = new Date("2026-01-02T00:00:00Z");
describe("persiapan pengiriman I-13", () => {
  it("menghasilkan payload ReportIt persis kontrak BE-11 dengan WIB → UTC", () => {
    expect(siapkanKirimLaporan(formTerisi(), sekarang)).toEqual({ valid: true, payload: { jenis: "REPORTIT", judul: "Sampah di tepi sungai", lokasi: "Teras Cikapundung", latitude: -6.885, longitude: 107.6065, waktu: "2026-01-01T02:30:00.000Z", sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK", idMedia: [21, 22] } });
  });
  it("CleanIt hanya mengirim judul, waktu, lokasiId, dan ID bukti", () => {
    const state = formTerisi(true);
    state.informasi = { ...state.informasi, lokasi: "", latitude: null, longitude: null, sumber: "", jenisSampah: "" };
    expect(siapkanKirimLaporan(state, sekarang)).toEqual({ valid: true, payload: { jenis: "CLEANIT", judul: "Sampah di tepi sungai", waktu: "2026-01-01T02:30:00.000Z", lokasiId: 7, idMedia: [21, 22] } });
  });
  it("memakai perubahan terbaru dan mengabaikan ID media yang dihapus", () => {
    let state = formTerisi();
    state = reducerFormLaporan(state, { tipe: "hapus-media", idLokal: "lokal-21" });
    state = reducerFormLaporan(state, { tipe: "informasi", perubahan: { judul: "Judul baru", waktu: "2026-01-01T00:15", latitude: -6.88 } });
    expect(siapkanKirimLaporan(state, sekarang)).toMatchObject({ valid: true, payload: { judul: "Judul baru", idMedia: [22], waktu: "2025-12-31T17:15:00.000Z", latitude: -6.88 } });
  });
  it.each([
    ["judul", { judul: " " }], ["judul", { judul: "x".repeat(81) }], ["lokasi", { lokasi: "" }],
    ["lokasi", { latitude: null }], ["lokasi", { longitude: NaN }], ["lokasi", { latitude: 91 }],
    ["waktu", { waktu: "2026-02-31T09:00" }], ["waktu", { waktu: "2027-01-01T09:00" }],
    ["sumber", { sumber: "" }], ["jenisSampah", { jenisSampah: "" }],
  ] as const)("memvalidasi ulang %s sebelum POST", (bagian, perubahan) => {
    const state = formTerisi(); state.informasi = { ...state.informasi, ...perubahan };
    const hasil = siapkanKirimLaporan(state, sekarang);
    expect(hasil.valid).toBe(false);
    if (!hasil.valid) expect(hasil.error.bagian[bagian]?.length).toBeGreaterThan(0);
    expect(state.media).toHaveLength(2);
  });
  it("wilayah tetap diputuskan BE agar 422 dapat ditangani di form", () => {
    const state = formTerisi(); state.informasi.latitude = -6.5;
    expect(siapkanKirimLaporan(state, sekarang).valid).toBe(true);
  });
  it.each(["kosong", "lebih-tiga", "belum-diunggah", "id-ganda", "id-terlalu-besar"])("menahan bukti %s", (kasus) => {
    const state = formTerisi();
    if (kasus === "kosong") state.media = [];
    if (kasus === "lebih-tiga") state.media = [...state.media, ...state.media];
    if (kasus === "belum-diunggah") state.media[0].unggahan = null;
    if (kasus === "id-ganda") state.media[1].unggahan!.idMedia = 21;
    if (kasus === "id-terlalu-besar") state.media[1].unggahan!.idMedia = 2_147_483_648;
    expect(siapkanKirimLaporan(state, sekarang)).toMatchObject({ valid: false, error: { bagian: { media: expect.any(Array) } } });
  });
  it("menolak lokasiId CleanIt yang tidak sesuai tipe serial BE", () => {
    const state = formTerisi(true); state.konfigurasi = { jenis: "CLEANIT", lokasiId: 0, namaLokasi: "Uji" };
    expect(siapkanKirimLaporan(state, sekarang)).toMatchObject({ valid: false, error: { bagian: { lokasi: expect.any(Array) } } });
  });
});

describe("error dan sukses BE-11", () => {
  it("mengelompokkan fields 400 ke kartu terkait tanpa mengekspos pesan debug", () => {
    const hasil = kegagalanKirimLaporan(new ApiError("FORMAT_TIDAK_VALID", 400, { pesanServer: "SQL private", fields: { judul: "Judul wajib diisi.", latitude: "Latitude salah.", longitude: "Longitude salah.", "idMedia.0": "Bukti tidak tersedia.", "idMedia[1]": "Bukti bukan milik Anda.", waktu: "Waktu salah.", sumber: "Pilih sumber.", jenisSampah: "Pilih jenis." } }));
    expect(hasil.bagian).toEqual({ judul: ["Judul wajib diisi."], lokasi: ["Latitude salah.", "Longitude salah."], media: ["Bukti tidak tersedia.", "Bukti bukan milik Anda."], waktu: ["Waktu salah."], sumber: ["Pilih sumber."], jenisSampah: ["Pilih jenis."] });
    expect(JSON.stringify(hasil)).not.toContain("SQL private");
  });
  it.each([[422, "DI_LUAR_WILAYAH", "lokasi"], [409, "MEDIA_SUDAH_DIGUNAKAN", "media"]] as const)("memberi panduan %i/%s pada bagian %s", (status, code, bagian) => {
    expect(kegagalanKirimLaporan(new ApiError(code, status)).bagian[bagian]?.length).toBeGreaterThan(0);
  });
  it.each(["LOKASI_SUDAH_DIBERSIHKAN", "CLEANIT_SUDAH_MENUNGGU"] as const)("menangani konflik CleanIt %s", (code) => {
    expect(kegagalanKirimLaporan(new ApiError(code, 409))).toMatchObject({ pilihLokasiLain: true });
  });
  it.each([null, {}, { idLaporan: 0, status: "BELUM_DIPERIKSA" }, { idLaporan: 1.5, status: "BELUM_DIPERIKSA" }, { idLaporan: 2_147_483_648, status: "BELUM_DIPERIKSA" }, { idLaporan: 7, status: "VALID" }])("menolak respons sukses yang rusak: %j", (respons) => {
    expect(hasilKirimValid(respons)).toBe(false);
  });
  it("menerima status menunggu dan menampilkan ID minimal 4 digit", () => {
    expect(hasilKirimValid({ idLaporan: 7, status: "BELUM_DIPERIKSA" })).toBe(true);
    expect(formatIdLaporan(7)).toBe("RPT-0007"); expect(formatIdLaporan(12345)).toBe("RPT-12345");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { validasiInformasiCleanIt, waktuMinimumCleanIt } from "@/lib/form-cleanit";
import { buatStateFormLaporan, reducerFormLaporan } from "@/lib/form-laporan";
import { drafDariState, kunciDraf } from "@/lib/draf-laporan";
import { siapkanKirimLaporan } from "@/lib/kirim-laporan";
import { formTerisi } from "./helpers/form-terisi";

const asal = "2026-11-10T02:15:30.500Z";
const sekarang = new Date("2026-11-12T03:00:00.000Z");
const informasi = { judul: "Pembersihan Teras Cikapundung", waktu: "2026-11-11T10:00" };
afterEach(() => vi.unstubAllEnvs());

describe("FE-17: judul dan batas waktu CleanIt", () => {
  it.each([
    ["judul", { judul: " \n " }, "wajib"],
    ["judul", { judul: "x".repeat(81) }, "80"],
    ["waktu", { waktu: "" }, "wajib"],
    ["waktu", { waktu: "tidak valid" }, "valid"],
    ["waktu", { waktu: "2026-02-30T10:00" }, "valid"],
    ["waktu", { waktu: "2026-11-11T10:00Z" }, "valid"],
    ["waktu", { waktu: "2026-11-10T09:15:30.499" }, "sebelum"],
    ["waktu", { waktu: "2026-11-12T10:00:00.001" }, "masa depan"],
  ] as const)("menolak %s sebelum melanjutkan: %j", (field, perubahan, pesan) => {
    const hasil = validasiInformasiCleanIt({ ...informasi, ...perubahan }, asal, sekarang);
    expect(hasil.valid).toBe(false); expect(hasil.fields[field]).toContain(pesan);
  });
  it.each(["2026-11-10T09:15:30.500", "2026-11-10T09:15:30.501", "2026-11-12T10:00"])("menerima waktu pada rentang inklusif %s", (waktu) => {
    expect(validasiInformasiCleanIt({ judul: ` ${"x".repeat(80)} `, waktu }, asal, sekarang)).toEqual({ valid: true, fields: {} });
  });
  it("tidak melewati batas waktu ketika konteks laporan asal rusak", () => {
    expect(validasiInformasiCleanIt(informasi, "rusak", sekarang)).toMatchObject({ valid: false, fields: { waktu: expect.stringContaining("laporan asal") } });
  });
  it.each(["UTC", "America/Los_Angeles", "Asia/Tokyo"])("WIB → UTC dan batas waktu sama pada perangkat %s", (zona) => {
    vi.stubEnv("TZ", zona);
    expect(waktuMinimumCleanIt("2026-11-10T09:15:30.500+07:00")).toBe("2026-11-10T09:15:30.500");
    expect(validasiInformasiCleanIt({ ...informasi, waktu: "2026-11-10T09:15:30.500" }, asal, sekarang).valid).toBe(true);
    const state = formTerisi(true);
    state.konfigurasi = { jenis: "CLEANIT", lokasiId: 32, namaLokasi: "Teras Cikapundung", waktuKejadianAsal: asal };
    state.informasi = { ...state.informasi, ...informasi };
    expect(siapkanKirimLaporan(state, sekarang)).toMatchObject({ valid: true, payload: { jenis: "CLEANIT", lokasiId: 32, waktu: "2026-11-11T03:00:00.000Z" } });
  });
});

describe("FE-17 → FE-09/12/13", () => {
  it("memakai judul default K7, konteks server, dan draf berbeda untuk setiap lokasi", () => {
    const a = buatStateFormLaporan({ konfigurasi: { jenis: "CLEANIT", lokasiId: 31, namaLokasi: "Pantai Ancol", waktuKejadianAsal: asal } });
    const b = buatStateFormLaporan({ konfigurasi: { jenis: "CLEANIT", lokasiId: 32, namaLokasi: "Nama lokasi yang sangat panjang ".repeat(8), waktuKejadianAsal: asal } });
    expect(a.informasi.judul).toBe("Pembersihan Pantai Ancol");
    expect(b.informasi.judul.length).toBeLessThanOrEqual(80); expect(b.informasi.judul).toMatch(/…$/);
    expect(kunciDraf(a.konfigurasi)).not.toBe(kunciDraf(b.konfigurasi));
    const pulih = reducerFormLaporan(b, { tipe: "informasi", perubahan: drafDariState(a).informasi });
    expect(pulih.konfigurasi).toEqual(b.konfigurasi); expect(pulih.media).toEqual([]);
    expect(reducerFormLaporan(pulih, { tipe: "reset" })).toEqual(b);
  });
  it("memvalidasi ulang waktu asal saat submit meskipun sudah mencapai I-13", () => {
    const state = formTerisi(true);
    state.konfigurasi = { jenis: "CLEANIT", lokasiId: 32, namaLokasi: "Teras Cikapundung", waktuKejadianAsal: asal };
    state.informasi.waktu = "2026-11-10T09:15:30.499";
    expect(siapkanKirimLaporan(state, sekarang)).toMatchObject({ valid: false, error: { bagian: { waktu: [expect.stringContaining("sebelum")] } } });
    expect(state.media).toHaveLength(2); expect(state.langkah).toBe(2);
  });
  it("Ubah → Simpan mempertahankan konteks asal dan hanya mengirim media yang masih dipilih", () => {
    let state = formTerisi(true);
    state.konfigurasi = { jenis: "CLEANIT", lokasiId: 32, namaLokasi: "Teras Cikapundung", waktuKejadianAsal: asal };
    state = reducerFormLaporan(state, { tipe: "ubah", bagian: "waktu" });
    state = reducerFormLaporan(state, { tipe: "informasi", perubahan: { ...informasi, lokasi: "field ReportIt diabaikan", sumber: "", jenisSampah: "" } });
    state = reducerFormLaporan(state, { tipe: "lanjut" });
    state = reducerFormLaporan(state, { tipe: "hapus-media", idLokal: "lokal-21" });
    expect(state.langkah).toBe(2);
    expect(siapkanKirimLaporan(state, sekarang)).toEqual({ valid: true, payload: { jenis: "CLEANIT", lokasiId: 32, judul: informasi.judul, waktu: "2026-11-11T03:00:00.000Z", idMedia: [22] } });
  });
});

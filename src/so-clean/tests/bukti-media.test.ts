import { afterEach, describe, expect, it, vi } from "vitest";
import { hasilUnggahValid, mediaSiapDikirim, periksaKuotaMedia, validasiPilihanMedia } from "../lib/bukti-media";
import { MAKS_UKURAN_MEDIA, type MediaFormLaporan } from "../lib/form-laporan";

const png = new File(["bukti"], "foto.png", { type: "image/png" });
const hasil = { idMedia: 1, url: "https://media.example.test/1", tipe: "FOTO" as const };
const item: MediaFormLaporan = { idLokal: "a", berkas: png, unggahan: hasil };

describe("pemilihan bukti I-12", () => {
  it.each(["image/jpeg", "image/png", "video/mp4"])("menerima format %s", (type) => {
    expect(validasiPilihanMedia([new File(["bukti"], "bukti", { type })], 0)).toBeNull();
  });
  it("menerima ukuran tepat 20 MiB dan menolak satu byte lebih besar", () => {
    expect(validasiPilihanMedia([new File([new Uint8Array(MAKS_UKURAN_MEDIA)], "batas.png", { type: "image/png" })], 0)).toBeNull();
    expect(validasiPilihanMedia([new File([new Uint8Array(MAKS_UKURAN_MEDIA + 1)], "besar.png", { type: "image/png" })], 0)).toContain("20 MB");
  });
  it("menolak file kosong dan format yang tidak didukung", () => {
    expect(validasiPilihanMedia([new File([], "kosong.png", { type: "image/png" })], 0)).toContain("kosong");
    expect(validasiPilihanMedia([new File(["x"], "file.heic", { type: "image/heic" })], 0)).toContain("JPG/PNG");
  });
  it("menghitung batas tiga bersama media yang sudah dipilih", () => {
    expect(validasiPilihanMedia([png, png], 1)).toBeNull();
    expect(validasiPilihanMedia([png, png], 2)).toContain("Maksimal 3");
  });
});

describe("kesiapan sebelum lanjut ke I-13", () => {
  it("memerlukan 1–3 hasil unggah yang benar-benar punya ID", () => {
    expect(mediaSiapDikirim([])).toBe(false);
    expect(mediaSiapDikirim([{ ...item, unggahan: null }])).toBe(false);
    expect(mediaSiapDikirim([item])).toBe(true);
    expect(mediaSiapDikirim([item, { ...item, idLokal: "b", unggahan: null }])).toBe(false);
    expect(mediaSiapDikirim(Array.from({ length: 4 }, (_, i) => ({ ...item, idLokal: String(i), unggahan: { ...hasil, idMedia: i + 1 } })))).toBe(false);
  });
  it("menolak ID hasil yang sama untuk dua file", () => {
    expect(mediaSiapDikirim([item, { ...item, idLokal: "b" }])).toBe(false);
  });
  it.each([null, {}, { ...hasil, idMedia: 0 }, { ...hasil, idMedia: 1.5 }, { ...hasil, url: "javascript:void(0)" }, { ...hasil, tipe: "VIDEO" }])("menolak respons yang tidak sesuai kontrak: %j", (value) => {
    expect(hasilUnggahValid(value, png)).toBe(false);
  });
  it("menerima respons video dan blob URL mock sesuai jenis berkas", () => {
    expect(hasilUnggahValid({ idMedia: 2, tipe: "VIDEO", url: "blob:http://localhost/video" }, new File(["mp4"], "v.mp4", { type: "video/mp4" }))).toBe(true);
  });
});

describe("kegagalan penyimpanan lokal N15", () => {
  afterEach(() => vi.unstubAllGlobals());
  function kuota(estimate?: () => Promise<StorageEstimate>) { vi.stubGlobal("navigator", { storage: estimate ? { estimate } : undefined }); }
  it("menolak kuota yang diketahui kurang dari total pilihan", async () => {
    kuota(async () => ({ usage: 90, quota: 100 }));
    await expect(periksaKuotaMedia(11)).rejects.toMatchObject({ name: "QuotaExceededError" });
    await expect(periksaKuotaMedia(10)).resolves.toBeUndefined();
  });
  it("meneruskan QuotaExceededError dari penyimpanan", async () => {
    kuota(async () => { throw new DOMException("Penuh", "QuotaExceededError"); });
    await expect(periksaKuotaMedia(1)).rejects.toMatchObject({ name: "QuotaExceededError" });
  });
  it("tidak menebak kuota jika API tidak tersedia atau estimasinya tidak lengkap", async () => {
    kuota(); await expect(periksaKuotaMedia(20)).resolves.toBeUndefined();
    kuota(async () => ({})); await expect(periksaKuotaMedia(20)).resolves.toBeUndefined();
    kuota(async () => { throw new DOMException("Ditolak", "SecurityError"); });
    await expect(periksaKuotaMedia(20)).resolves.toBeUndefined();
  });
});

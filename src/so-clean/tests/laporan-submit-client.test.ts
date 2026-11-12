import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/laporan/route";
import { ApiError, aturPenangananSesiHabis, tahanRequestSampai } from "@/lib/api/client";
import { laporanApi } from "@/lib/api/endpoints";
import { kegagalanKirimLaporan, siapkanKirimLaporan } from "@/lib/kirim-laporan";
import { formTerisi } from "./helpers/form-terisi";
import { cookieSesi } from "./helpers/sesi";

// Route, JWT, controller, validator, dan client asli; hanya batas penyimpanan diganti fixture.
const be = vi.hoisted(() => ({ transaction: vi.fn(), getMedia: vi.fn(), dipakai: vi.fn(), tautkan: vi.fn(), buat: vi.fn(), lokasi: vi.fn(), menunggu: vi.fn() }));
vi.mock("@/server/db", () => ({ db: { transaction: be.transaction } }));
vi.mock("@/server/models/media", () => ({ getUntukLaporan: be.getMedia, sudahDipakai: be.dipakai, tautkanKeLaporan: be.tautkan }));
vi.mock("@/server/models/laporan", () => ({ buatLaporan: be.buat, adaCleanItMenunggu: be.menunggu }));
vi.mock("@/server/models/lokasi", () => ({ getUntukValidasiCleanIt: be.lokasi }));
vi.mock("@/server/models/pengguna", () => ({}));
vi.mock("@/server/storage/s3", () => ({ getUrl: vi.fn() }));
const tx = { fixture: "transaksi uji" };
let cookie = "";
let transport: ReturnType<typeof vi.fn>;

function payload(cleanit = false) {
  const hasil = siapkanKirimLaporan(formTerisi(cleanit));
  if (!hasil.valid) throw new Error("Fixture belum valid");
  return hasil.payload;
}
beforeEach(async () => {
  vi.resetAllMocks();
  aturPenangananSesiHabis(null); tahanRequestSampai(Promise.resolve());
  cookie = await cookieSesi("pengguna-uji-fe12", "MASYARAKAT");
  be.transaction.mockImplementation(async (pekerjaan) => pekerjaan(tx));
  be.getMedia.mockImplementation(async (ids: number[], idPengguna: string) => ids.map((idMedia) => ({ idMedia, idPengguna, laporanId: null, sha256: `hash-${idMedia}` })));
  be.dipakai.mockResolvedValue(false); be.tautkan.mockImplementation(async (ids: number[]) => ids.length);
  be.buat.mockResolvedValue({ idLaporan: 7 }); be.menunggu.mockResolvedValue(false);
  be.lokasi.mockResolvedValue({ status: "TERCEMAR", waktuKejadianAsal: new Date("2025-12-01T00:00:00Z") });
  transport = vi.fn(async (input: string, init: RequestInit) => {
    const headers = new Headers(init.headers); if (cookie) headers.set("cookie", cookie);
    return POST(new Request(input, { ...init, headers }));
  });
  vi.stubGlobal("fetch", transport);
  vi.spyOn(console, "info").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("FE-12 → POST /api/laporan BE-11", () => {
  it.each([false, true])("mengirim JSON %s, memakai JWT, dan menautkan bukti dalam transaksi yang sama", async (cleanit) => {
    const body = payload(cleanit);
    await expect(laporanApi.buat(body)).resolves.toEqual({ idLaporan: 7, status: "BELUM_DIPERIKSA" });
    expect(transport).toHaveBeenCalledWith("http://localhost/api/laporan", expect.objectContaining({ method: "POST", credentials: "same-origin", body: JSON.stringify(body), headers: { Accept: "application/json", "Content-Type": "application/json" } }));
    expect(be.buat).toHaveBeenCalledWith(expect.objectContaining({ judul: "Sampah di tepi sungai", idPengguna: "pengguna-uji-fe12", waktu: new Date("2026-01-01T02:30:00Z") }), tx);
    expect(be.tautkan).toHaveBeenCalledWith([21, 22], "pengguna-uji-fe12", 7, tx);
    if (cleanit) expect(be.lokasi).toHaveBeenCalledWith(7, tx);
  });
  it("400 kelengkapan tetap menjadi ApiError.fields di FE", async () => {
    await expect(laporanApi.buat({ ...payload(), judul: " " })).rejects.toMatchObject({ code: "DATA_TIDAK_LENGKAP", status: 400, fields: { judul: expect.any(String) } });
    expect(be.buat).not.toHaveBeenCalled();
  });
  it("400 media milik pengguna lain dipetakan ke kartu bukti", async () => {
    be.getMedia.mockResolvedValue([]);
    const error = await laporanApi.buat(payload()).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError); expect(error).toMatchObject({ code: "FORMAT_TIDAK_VALID", status: 400 });
    expect(kegagalanKirimLaporan(error).bagian.media).toEqual(["Media tidak ditemukan atau bukan milik Anda."]);
    expect(be.buat).not.toHaveBeenCalled();
  });
  it("422 lokasi di luar wilayah tidak menulis laporan", async () => {
    const body = payload(); if (body.jenis !== "REPORTIT") throw new Error("ReportIt diperlukan");
    await expect(laporanApi.buat({ ...body, latitude: -6.5 })).rejects.toMatchObject({ status: 422, code: "DI_LUAR_WILAYAH" });
    expect(be.buat).not.toHaveBeenCalled();
  });
  it("409 hash bukti yang sudah digunakan dapat diperbaiki dengan mengganti bukti", async () => {
    be.dipakai.mockResolvedValue(true);
    await expect(laporanApi.buat(payload())).rejects.toMatchObject({ status: 409, code: "MEDIA_SUDAH_DIGUNAKAN" });
    expect(be.buat).not.toHaveBeenCalled();
  });
  it.each(["dibersihkan", "menunggu", "waktu"])("meneruskan aturan CleanIt: %s", async (kasus) => {
    if (kasus === "dibersihkan") be.lokasi.mockResolvedValue({ status: "DIBERSIHKAN" });
    if (kasus === "menunggu") be.menunggu.mockResolvedValue(true);
    if (kasus === "waktu") be.lokasi.mockResolvedValue({ status: "TERCEMAR", waktuKejadianAsal: new Date("2026-02-01T00:00:00Z") });
    await expect(laporanApi.buat(payload(true))).rejects.toMatchObject(kasus === "waktu" ? { status: 400, code: "FORMAT_TIDAK_VALID", fields: { waktu: expect.any(String) } } : { status: 409, code: kasus === "dibersihkan" ? "LOKASI_SUDAH_DIBERSIHKAN" : "CLEANIT_SUDAH_MENUNGGU" });
    expect(be.buat).not.toHaveBeenCalled();
  });
  it("401 tetap memanggil penangan sesi terpusat", async () => {
    cookie = ""; const sesiHabis = vi.fn(); aturPenangananSesiHabis(sesiHabis);
    await expect(laporanApi.buat(payload())).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" }); expect(sesiHabis).toHaveBeenCalledOnce();
  });
  it("403 menolak Operator sebelum transaksi", async () => {
    cookie = await cookieSesi("operator-uji", "OPERATOR");
    await expect(laporanApi.buat(payload())).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" }); expect(be.transaction).not.toHaveBeenCalled();
  });
  it("kegagalan jaringan tidak mengulang POST secara otomatis", async () => {
    transport.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(laporanApi.buat(payload())).rejects.toMatchObject({ code: "JARINGAN", status: 0 }); expect(transport).toHaveBeenCalledOnce();
  });
  it("meneruskan AbortSignal ketika halaman ditinggalkan", async () => {
    const pengendali = new AbortController(); await laporanApi.buat(payload(), { signal: pengendali.signal });
    expect(transport.mock.calls[0][1].signal).toBe(pengendali.signal);
  });
});

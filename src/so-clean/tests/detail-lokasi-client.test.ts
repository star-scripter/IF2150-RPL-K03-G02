import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/lokasi/[id]/route";
import { aturPenangananSesiHabis, tahanRequestSampai } from "@/lib/api/client";
import { lokasiApi } from "@/lib/api/endpoints";
import { bacaDetailLokasi } from "@/lib/detail-lokasi";
import { cookieSesi } from "./helpers/sesi";
import { detailLokasiUji } from "./helpers/detail-lokasi-fe16";

// Client, route, JWT, controller, dan validator BE-17 asli; model/storage memakai fixture.
const be = vi.hoisted(() => ({ lokasi: vi.fn(), url: vi.fn() }));
vi.mock("@/server/models/lokasi", () => ({ get_lokasi: be.lokasi }));
vi.mock("@/server/storage/s3", () => ({ getUrl: be.url }));
let cookie: string;
let transport: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  vi.resetAllMocks(); aturPenangananSesiHabis(null); tahanRequestSampai(Promise.resolve());
  cookie = await cookieSesi("masyarakat-fe16", "MASYARAKAT");
  be.lokasi.mockImplementation(async (id: number) => {
    const detail = detailLokasiUji(id);
    return { ...detail, laporanAsal: { ...detail.laporanAsal, media: detail.laporanAsal.media.map((media) => ({ idMedia: media.idMedia, tipe: media.tipe, createdAt: media.createdAt, storageKey: `uji/${media.idMedia}` })) } };
  });
  be.url.mockImplementation(async (key: string) => `https://media.example.test/${key}`);
  transport = vi.fn(async (url: string, init: RequestInit) => {
    const headers = new Headers(init.headers); if (cookie) headers.set("cookie", cookie);
    return GET(new Request(url, { ...init, headers }), { params: Promise.resolve({ id: new URL(url).pathname.split("/").pop()! }) });
  });
  vi.stubGlobal("fetch", transport);
  vi.spyOn(console, "info").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("FE-16 → GET /api/lokasi/:id BE-17", () => {
  it.each([31, 32])("memuat ID %i dengan laporan asal dan URL seluruh bukti", async (id) => {
    const hasil = bacaDetailLokasi(await lokasiApi.detail(id), id);
    expect(hasil.idLokasi).toBe(id); expect(be.lokasi).toHaveBeenCalledWith(id);
    expect(hasil.laporanAsal.media).toHaveLength(2);
    expect(hasil.laporanAsal.media.every((media) => media.url.startsWith("https://media.example.test/uji/"))).toBe(true);
    expect(transport).toHaveBeenCalledWith(`http://localhost/api/lokasi/${id}`, expect.objectContaining({ method: "GET", credentials: "same-origin", body: undefined }));
    expect(be.url).toHaveBeenCalledTimes(2);
  });
  it("404 menjadi NOT_FOUND untuk halaman tidak ditemukan", async () => {
    be.lokasi.mockResolvedValue(null);
    await expect(lokasiApi.detail(99)).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });
  it("BE tetap menolak ID yang tidak valid sebelum membaca model", async () => {
    await expect(lokasiApi.detail(0)).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", status: 400 });
    expect(be.lokasi).not.toHaveBeenCalled();
  });
  it("sesi habis memakai penangan terpusat FE-04", async () => {
    cookie = ""; const sesiHabis = vi.fn(); aturPenangananSesiHabis(sesiHabis);
    await expect(lokasiApi.detail(32)).rejects.toMatchObject({ code: "UNAUTHORIZED", status: 401 }); expect(sesiHabis).toHaveBeenCalledOnce();
    expect(be.lokasi).not.toHaveBeenCalled();
  });
  it("server gagal lalu retry dapat memuat detail kembali", async () => {
    be.lokasi.mockRejectedValueOnce(new Error("detail internal"));
    await expect(lokasiApi.detail(32)).rejects.toMatchObject({ code: "INTERNAL_ERROR", status: 500 });
    await expect(lokasiApi.detail(32)).resolves.toMatchObject({ idLokasi: 32 });
  });
  it("kegagalan jaringan mempertahankan klasifikasi JARINGAN", async () => {
    transport.mockRejectedValue(new TypeError("network failed"));
    await expect(lokasiApi.detail(32)).rejects.toMatchObject({ code: "JARINGAN", status: 0 });
  });
  it("AbortSignal diteruskan untuk request yang tidak lagi dipakai", async () => {
    const pengendali = new AbortController(); await lokasiApi.detail(32, { signal: pengendali.signal });
    expect(transport.mock.calls[0][1].signal).toBe(pengendali.signal);
  });
});

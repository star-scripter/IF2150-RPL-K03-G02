import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/lokasi/route";
import { aturPenangananSesiHabis, tahanRequestSampai } from "@/lib/api/client";
import { lokasiApi } from "@/lib/api/endpoints";
import { bacaDaftarLokasi, urutkanLokasi } from "@/lib/lokasi";
import { cookieSesi } from "./helpers/sesi";
import { LOKASI_UJI_FE14, POSISI_UJI_FE14 } from "./helpers/lokasi-fe14";

// Client, route, guard JWT, controller, dan validasi BE-17 asli; hanya model penyimpanan diganti.
const model = vi.hoisted(() => ({ daftar: vi.fn() }));
vi.mock("@/server/models/lokasi", () => ({ get_all_lokasi_valid: model.daftar }));
let cookie: string;
let fetchUji: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  vi.resetAllMocks(); aturPenangananSesiHabis(null); tahanRequestSampai(Promise.resolve());
  cookie = await cookieSesi("masyarakat-fe14", "MASYARAKAT"); model.daftar.mockResolvedValue(LOKASI_UJI_FE14);
  fetchUji = vi.fn(async (input: string, init: RequestInit) => {
    const headers = new Headers(init.headers); if (cookie) headers.set("cookie", cookie);
    return GET(new Request(input, { ...init, headers }));
  });
  vi.stubGlobal("fetch", fetchUji);
  vi.spyOn(console, "info").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("FE-14 → GET /api/lokasi BE-17", () => {
  it("mengambil seluruh lokasi TERCEMAR tanpa query koordinat atau radius", async () => {
    const daftar = bacaDaftarLokasi(await lokasiApi.daftar({ status: "TERCEMAR" }));
    expect(daftar).toEqual(LOKASI_UJI_FE14);
    expect(fetchUji).toHaveBeenCalledWith("http://localhost/api/lokasi?status=TERCEMAR", expect.objectContaining({ method: "GET", credentials: "same-origin" }));
    expect(model.daftar).toHaveBeenCalledWith("TERCEMAR");
    expect(urutkanLokasi(daftar, "terdekat", POSISI_UJI_FE14).map((lokasi) => lokasi.idLokasi)).toEqual([32, 31, 33]);
    expect(urutkanLokasi(daftar, "terbaru", null).map((lokasi) => lokasi.idLokasi)).toEqual([31, 32, 33]);
    expect(fetchUji).toHaveBeenCalledOnce();
  });
  it("memakai default TERCEMAR BE-17 saat query tidak diisi", async () => {
    await lokasiApi.daftar(); expect(model.daftar).toHaveBeenCalledWith("TERCEMAR");
  });
  it("respons [] menjadi daftar kosong yang sah untuk FE-15", async () => {
    model.daftar.mockResolvedValue([]);
    expect(bacaDaftarLokasi(await lokasiApi.daftar())).toEqual([]);
  });
  it("401 tetap memakai penangan sesi habis bersama", async () => {
    cookie = ""; const sesiHabis = vi.fn(); aturPenangananSesiHabis(sesiHabis);
    await expect(lokasiApi.daftar()).rejects.toMatchObject({ code: "UNAUTHORIZED", status: 401 });
    expect(sesiHabis).toHaveBeenCalledOnce(); expect(model.daftar).not.toHaveBeenCalled();
  });
  it("kegagalan server diteruskan sebagai pesan API yang dapat dicoba lagi", async () => {
    model.daftar.mockRejectedValueOnce(new Error("detail internal"));
    await expect(lokasiApi.daftar()).rejects.toMatchObject({ code: "INTERNAL_ERROR", status: 500 });
    await expect(lokasiApi.daftar()).resolves.toHaveLength(3);
  });
  it("kegagalan jaringan tidak berubah menjadi daftar kosong", async () => {
    fetchUji.mockRejectedValue(new TypeError("network failed"));
    await expect(lokasiApi.daftar()).rejects.toMatchObject({ code: "JARINGAN", status: 0 });
  });
  it("AbortSignal diteruskan agar request lama dapat dibatalkan", async () => {
    const pengendali = new AbortController(); await lokasiApi.daftar({}, { signal: pengendali.signal });
    expect(fetchUji.mock.calls[0][1].signal).toBe(pengendali.signal);
  });
});

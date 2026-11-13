import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/lokasi/[id]/route";
import { POST } from "@/app/api/laporan/route";
import { aturPenangananSesiHabis, tahanRequestSampai } from "@/lib/api/client";
import { lokasiApi, laporanApi } from "@/lib/api/endpoints";
import { bacaDetailLokasi } from "@/lib/detail-lokasi";
import { buatStateFormLaporan } from "@/lib/form-laporan";
import { kegagalanKirimLaporan, siapkanKirimLaporan } from "@/lib/kirim-laporan";
import { cookieSesi } from "./helpers/sesi";
import { detailLokasiUji } from "./helpers/detail-lokasi-fe16";

// Jalur client → route → JWT → controller/validator asli; hanya penyimpanan memakai fixture.
const be = vi.hoisted(() => ({ transaction: vi.fn(), detail: vi.fn(), lokasi: vi.fn(), menunggu: vi.fn(), media: vi.fn(), dipakai: vi.fn(), buat: vi.fn(), tautkan: vi.fn() }));
vi.mock("@/server/db", () => ({ db: { transaction: be.transaction } }));
vi.mock("@/server/models/lokasi", () => ({ get_lokasi: be.detail, getUntukValidasiCleanIt: be.lokasi }));
vi.mock("@/server/models/laporan", () => ({ buatLaporan: be.buat, adaCleanItMenunggu: be.menunggu }));
vi.mock("@/server/models/media", () => ({ getUntukLaporan: be.media, sudahDipakai: be.dipakai, tautkanKeLaporan: be.tautkan }));
vi.mock("@/server/models/pengguna", () => ({}));
vi.mock("@/server/storage/s3", () => ({ getUrl: async (key: string) => `https://media.example.test/${key}` }));
const tx = { fixture: "transaksi FE-17" };
const asal = detailLokasiUji().laporanAsal.waktu;
const sekarang = new Date("2026-11-12T03:00:00Z");
let cookie: string;

beforeEach(async () => {
  vi.resetAllMocks(); tahanRequestSampai(Promise.resolve()); aturPenangananSesiHabis(null);
  cookie = await cookieSesi("masyarakat-fe17", "MASYARAKAT");
  be.detail.mockImplementation(async (id: number) => ({ ...detailLokasiUji(id), laporanAsal: { ...detailLokasiUji(id).laporanAsal, media: [] } }));
  be.lokasi.mockResolvedValue({ status: "TERCEMAR", waktuKejadianAsal: new Date(asal) });
  be.transaction.mockImplementation(async (fn) => fn(tx)); be.menunggu.mockResolvedValue(false);
  be.media.mockImplementation(async (ids: number[], idPengguna: string) => ids.map((idMedia) => ({ idMedia, idPengguna, laporanId: null, sha256: `foto-${idMedia}` })));
  be.dipakai.mockResolvedValue(false); be.buat.mockResolvedValue({ idLaporan: 417 }); be.tautkan.mockImplementation(async (ids: number[]) => ids.length);
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    const headers = new Headers(init.headers); if (cookie) headers.set("cookie", cookie);
    const req = new Request(url, { ...init, headers });
    return init.method === "POST" ? POST(req) : GET(req, { params: Promise.resolve({ id: new URL(url).pathname.split("/").pop()! }) });
  });
  for (const level of ["info", "warn", "error"] as const) vi.spyOn(console, level).mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function persiapan() {
  const lokasi = bacaDetailLokasi(await lokasiApi.detail(32), 32);
  const state = buatStateFormLaporan({ konfigurasi: { jenis: "CLEANIT", lokasiId: lokasi.idLokasi, namaLokasi: lokasi.nama, waktuKejadianAsal: lokasi.laporanAsal.waktu }, informasi: { waktu: "2026-11-10T09:15" } });
  state.langkah = 2;
  state.media = [{ idLokal: "bukti-baru", berkas: new File(["uji"], "setelah.png", { type: "image/png" }), unggahan: { idMedia: 501, tipe: "FOTO", url: "https://media.example.test/setelah.png" } }];
  const hasil = siapkanKirimLaporan(state, sekarang);
  if (!hasil.valid) throw new Error("Fixture CleanIt tidak valid");
  return { state, payload: hasil.payload };
}

describe("FE-17 → detail BE-17 → pengiriman BE-11", () => {
  it("memakai ID/waktu asal hasil GET, menerima batas tepat, dan menautkan bukti dalam transaksi", async () => {
    const { payload } = await persiapan();
    expect(payload).toEqual({ jenis: "CLEANIT", lokasiId: 32, judul: "Pembersihan Teras Cikapundung", waktu: asal, idMedia: [501] });
    await expect(laporanApi.buat(payload)).resolves.toEqual({ idLaporan: 417, status: "BELUM_DIPERIKSA" });
    expect(be.lokasi).toHaveBeenCalledWith(32, tx);
    expect(be.buat).toHaveBeenCalledWith(expect.objectContaining({ jenis: "CLEANIT", lokasiId: 32, idPengguna: "masyarakat-fe17", waktu: new Date(asal) }), tx);
    expect(be.tautkan).toHaveBeenCalledWith([501], "masyarakat-fe17", 417, tx);
  });
  it.each(["dibersihkan", "hilang", "menunggu", "media"])("memetakan perubahan setelah form dibuka: %s; state tidak dihapus", async (kasus) => {
    const { state, payload } = await persiapan();
    const sebelum = JSON.stringify(state);
    if (kasus === "dibersihkan") be.lokasi.mockResolvedValue({ status: "DIBERSIHKAN" });
    if (kasus === "hilang") be.lokasi.mockResolvedValue(null);
    if (kasus === "menunggu") be.menunggu.mockResolvedValue(true);
    if (kasus === "media") be.dipakai.mockResolvedValue(true);
    const error = await laporanApi.buat(payload).catch((e) => e);
    expect(error.code).toBe({ dibersihkan: "LOKASI_SUDAH_DIBERSIHKAN", hilang: "NOT_FOUND", menunggu: "CLEANIT_SUDAH_MENUNGGU", media: "MEDIA_SUDAH_DIGUNAKAN" }[kasus]);
    expect(kegagalanKirimLaporan(error)).toMatchObject(kasus === "media" ? { bagian: { media: [expect.stringContaining("Hapus bukti")] } } : { pilihLokasiLain: true });
    expect(be.buat).not.toHaveBeenCalled(); expect(JSON.stringify(state)).toBe(sebelum);
  });
  it("BE memeriksa ulang waktu dan mengembalikan fields.waktu untuk I-13", async () => {
    const { payload } = await persiapan();
    be.lokasi.mockResolvedValue({ status: "TERCEMAR", waktuKejadianAsal: new Date("2026-11-11T00:00Z") });
    const error = await laporanApi.buat(payload).catch((e) => e);
    expect(error).toMatchObject({ code: "FORMAT_TIDAK_VALID", status: 400 });
    expect(kegagalanKirimLaporan(error).bagian.waktu).toEqual([expect.any(String)]); expect(be.buat).not.toHaveBeenCalled();
  });
  it("sesi habis mengikuti handler FE-04", async () => {
    const { payload } = await persiapan(); cookie = "";
    const sesiHabis = vi.fn(); aturPenangananSesiHabis(sesiHabis);
    await expect(laporanApi.buat(payload)).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(sesiHabis).toHaveBeenCalledOnce(); expect(be.transaction).not.toHaveBeenCalled();
  });
});

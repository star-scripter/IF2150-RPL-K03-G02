import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/client";
import { bacaDetailLokasi, bacaIdLokasi, urlFormCleanIt } from "@/lib/detail-lokasi";
import { formatWaktuLengkap } from "@/lib/laporan";
import { detailLokasiUji } from "./helpers/detail-lokasi";

describe("ID dan tujuan navigasi FE-16", () => {
  it.each(["", "0", "-1", "01", "1.5", "1e2", "abc", " 32", "32 ", "2147483648", "Infinity"])("menolak ID URL yang tidak sah: %j", (value) => {
    expect(bacaIdLokasi(value)).toBeNull();
  });
  it.each([1, 32, 2147483647])("menerima ID serial %i tanpa mengubah nilainya", (id) => {
    expect(bacaIdLokasi(String(id))).toBe(id); expect(urlFormCleanIt(id)).toBe(`/cleanit/${id}`);
  });
  it.each([0, -1, NaN, Infinity, 1.5, 2147483648])("menahan pembuatan URL dari ID angka yang rusak: %j", (id) => {
    expect(() => urlFormCleanIt(id)).toThrow(RangeError);
  });
});

describe("detail lokasi dari BE-17", () => {
  it.each(["TERCEMAR", "DIBERSIHKAN"] as const)("menerima detail dan seluruh bukti status %s", (status) => {
    const detail = detailLokasiUji(32, status);
    expect(bacaDetailLokasi(detail, 32)).toEqual(detail);
  });
  it("menolak respons yang menunjuk lokasi lain", () => {
    expect(() => bacaDetailLokasi(detailLokasiUji(31), 32)).toThrow(ApiError);
  });
  it.each([
    null,
    { ...detailLokasiUji(), latitude: NaN },
    { ...detailLokasiUji(), longitude: 181 },
    { ...detailLokasiUji(), poin: 30 },
    { ...detailLokasiUji(), status: "RESERVASI" },
    { ...detailLokasiUji(), laporanAsal: null },
    { ...detailLokasiUji(), laporanAsal: { ...detailLokasiUji().laporanAsal, waktu: "bukan tanggal" } },
    { ...detailLokasiUji(), laporanAsal: { ...detailLokasiUji().laporanAsal, sumber: "INVALID" } },
  ])("respons rusak menjadi error API yang dapat ditangani: %j", (data) => {
    try { bacaDetailLokasi(data, 32); throw new Error("Seharusnya gagal"); }
    catch (error) { expect(error).toMatchObject({ code: "INTERNAL_ERROR", status: 200 }); }
  });
  it("tetap menerima informasi detail ketika belum ada media atau tautan media kosong", () => {
    const detail = detailLokasiUji(); detail.laporanAsal.media = [];
    expect(bacaDetailLokasi(detail, 32).laporanAsal.media).toEqual([]);
    detail.laporanAsal.media = [{ idMedia: 1, tipe: "FOTO", url: "", createdAt: "2026-11-10T02:30:00Z" }];
    expect(bacaDetailLokasi(detail, 32).laporanAsal.media[0].url).toBe("");
  });
  it("waktu kejadian, waktu laporan masuk, dan waktu unggah tetap berbeda dengan format WIB", () => {
    const detail = bacaDetailLokasi(detailLokasiUji(), 32);
    expect(formatWaktuLengkap(detail.laporanAsal.waktu)).toContain("09.15 WIB");
    expect(formatWaktuLengkap(detail.laporanAsal.media[0].createdAt)).toContain("09.30 WIB");
    expect(detail.dilaporkanAt).not.toBe(detail.laporanAsal.waktu);
  });
});

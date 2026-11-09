import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { laporan } from "@/server/db/schema";
import {
  buatLaporan as buatLaporanModel,
  getDaftarLaporan,
  getLaporanById,
  simpan_alasan_penolakan,
  ubah_status,
} from "@/server/models/laporan";
import { DATABASE_TEST_AKTIF, buatLokasi, buatPengguna, kosongkanDatabase } from "./helpers/db";

describe.runIf(DATABASE_TEST_AKTIF)("model Laporan (C02)", () => {
  let idPengguna: string;
  let idOperator: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    idPengguna = (await buatPengguna()).id;
    idOperator = (await buatPengguna({ role: "OPERATOR" })).id;
  });

  it("membuat ReportIt dan CleanIt dengan kolom sesuai jenis, lalu mencari berdasarkan ID", async () => {
    const waktu = new Date("2026-11-05T10:30:00.000Z");
    const reportIt = await buatLaporanModel({
      jenis: "REPORTIT",
      idPengguna,
      judul: "Sampah di tepi sungai",
      waktu,
      lokasi: "Jl. Uji No. 1",
      latitude: -6.885,
      longitude: 107.6065,
      sumber: "PENGAMATAN_PRIBADI",
      jenisSampah: "PLASTIK",
    });

    expect(reportIt).toMatchObject({
      idLaporan: expect.any(Number),
      jenis: "REPORTIT",
      idPengguna,
      judul: "Sampah di tepi sungai",
      waktu,
      lokasi: "Jl. Uji No. 1",
      latitude: -6.885,
      longitude: 107.6065,
      sumber: "PENGAMATAN_PRIBADI",
      jenisSampah: "PLASTIK",
      lokasiId: null,
      status: "BELUM_DIPERIKSA",
      alasanPenolakan: null,
      diverifikasiOleh: null,
      diverifikasiAt: null,
      createdAt: expect.any(Date),
    });
    await expect(getLaporanById(reportIt.idLaporan)).resolves.toEqual(reportIt);
    await expect(getLaporanById(999999)).resolves.toBeNull();

    const { idLokasi } = await buatLokasi({ pelapor: idPengguna, operator: idOperator });
    const cleanIt = await buatLaporanModel({
      jenis: "CLEANIT",
      idPengguna,
      judul: "Pembersihan lokasi",
      waktu,
      lokasiId: idLokasi,
    });
    expect(cleanIt).toMatchObject({
      jenis: "CLEANIT",
      lokasi: null,
      latitude: null,
      longitude: null,
      sumber: null,
      jenisSampah: null,
      lokasiId: idLokasi,
      status: "BELUM_DIPERIKSA",
    });
  });

  it("memfilter jenis/status dan memaginasi terbaru/terlama berdasarkan createdAt", async () => {
    const buatReportIt = (judul: string) =>
      buatLaporanModel({
        jenis: "REPORTIT",
        idPengguna,
        judul,
        waktu: new Date("2026-11-01T00:00:00.000Z"),
        lokasi: "Jl. Uji No. 2",
        latitude: -6.12,
        longitude: 106.83,
        sumber: "INFO_WARGA",
        jenisSampah: "PLASTIK",
      });

    const pertama = await buatReportIt("Pertama");
    const kedua = await buatReportIt("Kedua");
    const ketiga = await buatReportIt("Ketiga");
    const { idLokasi } = await buatLokasi({ pelapor: idPengguna, operator: idOperator });
    await buatLaporanModel({
      jenis: "CLEANIT",
      idPengguna,
      judul: "CleanIt",
      waktu: new Date("2026-11-01T00:00:00.000Z"),
      lokasiId: idLokasi,
    });

    await db.update(laporan).set({ createdAt: new Date("2026-11-01T00:00:00Z") }).where(eq(laporan.id, pertama.idLaporan));
    await db.update(laporan).set({ createdAt: new Date("2026-11-03T00:00:00Z") }).where(eq(laporan.id, kedua.idLaporan));
    await db.update(laporan).set({ createdAt: new Date("2026-11-02T00:00:00Z") }).where(eq(laporan.id, ketiga.idLaporan));
    await ubah_status(ketiga.idLaporan, {
      status: "VALID",
      diverifikasiOleh: idOperator,
      diverifikasiAt: new Date("2026-11-04T00:00:00Z"),
    });

    const terbaru = await getDaftarLaporan({
      jenis: "REPORTIT",
      status: "BELUM_DIPERIKSA",
      sort: "terbaru",
      page: 1,
      limit: 1,
    });
    expect(terbaru).toEqual({ data: [expect.objectContaining({ idLaporan: kedua.idLaporan })], total: 2 });

    const halamanDua = await getDaftarLaporan({
      jenis: "REPORTIT",
      status: "BELUM_DIPERIKSA",
      sort: "terbaru",
      page: 2,
      limit: 1,
    });
    expect(halamanDua).toEqual({ data: [expect.objectContaining({ idLaporan: pertama.idLaporan })], total: 2 });

    const terlama = await getDaftarLaporan({
      jenis: "REPORTIT",
      status: "BELUM_DIPERIKSA",
      sort: "terlama",
      page: 1,
      limit: 10,
    });
    expect(terlama.data.map(({ idLaporan }) => idLaporan)).toEqual([
      pertama.idLaporan,
      kedua.idLaporan,
    ]);
    expect(terlama.total).toBe(2);

    const cleanIt = await getDaftarLaporan({ jenis: "CLEANIT", page: 1, limit: 10 });
    expect(cleanIt.data.map(({ jenis }) => jenis)).toEqual(["CLEANIT"]);
    expect(cleanIt.total).toBe(1);
  });

  it("mengubah status dan menyimpan alasan penolakan melalui tx", async () => {
    const baru = await buatLaporanModel({
      jenis: "REPORTIT",
      idPengguna,
      judul: "Perlu ditolak",
      waktu: new Date(),
      lokasi: "Jl. Uji No. 3",
      latitude: -6.1,
      longitude: 106.8,
      sumber: "INFO_WARGA",
      jenisSampah: "PLASTIK",
    });
    const diverifikasiAt = new Date("2026-11-06T12:00:00.000Z");

    const ditolak = await db.transaction(async (tx) => {
      const denganAlasan = await simpan_alasan_penolakan(baru.idLaporan, "Bukti tidak memadai.", tx);
      expect(denganAlasan?.alasanPenolakan).toBe("Bukti tidak memadai.");
      return ubah_status(
        baru.idLaporan,
        { status: "TIDAK_VALID", diverifikasiOleh: idOperator, diverifikasiAt },
        tx,
      );
    });

    expect(ditolak).toMatchObject({
      idLaporan: baru.idLaporan,
      status: "TIDAK_VALID",
      alasanPenolakan: "Bukti tidak memadai.",
      diverifikasiOleh: idOperator,
      diverifikasiAt,
    });
    await expect(ubah_status(999999, { status: "BELUM_DIPERIKSA" })).resolves.toBeNull();
    await expect(simpan_alasan_penolakan(999999, "Alasan")).resolves.toBeNull();
  });
});

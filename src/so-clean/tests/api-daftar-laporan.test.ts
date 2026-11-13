import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getDaftar } from "@/app/api/laporan/route";
import { GET as getDetail } from "@/app/api/laporan/[id]/route";
import type { Laporan, LaporanDetail, Role } from "@/types/api";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatMedia,
  buatPengguna,
  kosongkanDatabase,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const LAT = -6.885;
const LNG = 107.6065;
const MENIT = 60 * 1000;

let operator: string;

async function daftar(query = "", sebagai: { id: string; role: Role } | null = { id: operator, role: "OPERATOR" }) {
  const cookie = sebagai ? await cookieSesi(sebagai.id, sebagai.role) : undefined;
  return getDaftar(buatRequest(`/api/laporan${query}`, { cookie }));
}

async function detail(id: string, sebagai: { id: string; role: Role } | null = { id: operator, role: "OPERATOR" }) {
  const cookie = sebagai ? await cookieSesi(sebagai.id, sebagai.role) : undefined;
  return getDetail(buatRequest(`/api/laporan/${id}`, { cookie }), { params: Promise.resolve({ id }) });
}

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/laporan dan /api/laporan/:id (BE-12)", () => {
  let pelapor: string;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("S3_ENDPOINT", "http://rustfs:9000");
    vi.stubEnv("S3_PUBLIC_ENDPOINT", "http://localhost:9000");
    vi.stubEnv("S3_BUCKET", "soclean-media");
    vi.stubEnv("S3_ACCESS_KEY_ID", "kunci-uji");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "rahasia-uji");
    vi.stubEnv("S3_FORCE_PATH_STYLE", "true");

    await kosongkanDatabase();
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    pelapor = (await buatPengguna({ nama: "Budi Santoso" })).id;
  });

  describe("GET /api/laporan", () => {
    it("menolak tamu (401) dan Masyarakat (403)", async () => {
      expect((await daftar("", null)).status).toBe(401);
      const res = await daftar("", { id: pelapor, role: "MASYARAKAT" });
      expect(res.status).toBe(403);
      expect((await res.json()).error.code).toBe("FORBIDDEN");
    });

    it("default: hanya BELUM_DIPERIKSA, terbaru dulu, limit 6, dengan meta.total", async () => {
      const sekarang = Date.now();
      const lama = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, createdAt: new Date(sekarang - 30 * MENIT) });
      const baru = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, createdAt: new Date(sekarang - 10 * MENIT) });
      await buatLokasi({ pelapor, operator }); // laporan asal VALID, tidak ikut

      const res = await daftar();
      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: Laporan[]; meta: unknown };

      expect(body.meta).toEqual({ page: 1, limit: 6, total: 2 });
      expect(body.data.map((l) => l.idLaporan)).toEqual([baru.idLaporan, lama.idLaporan]);
      expect(body.data[0]).toEqual({
        idLaporan: baru.idLaporan,
        jenis: "REPORTIT",
        judul: "Laporan REPORTIT",
        lokasi: "Jl. Uji No. 2",
        latitude: -6.12,
        longitude: 106.83,
        waktu: expect.any(String),
        createdAt: new Date(sekarang - 10 * MENIT).toISOString(),
        sumber: "INFO_WARGA",
        jenisSampah: "PLASTIK",
        status: "BELUM_DIPERIKSA",
      });
    });

    it("CleanIt memakai nama, koordinat, dan jenis sampah lokasi terkait; sumber null", async () => {
      const { idLokasi } = await buatLokasi({ pelapor, operator, nama: "Bantaran Teras", jenisSampah: "ORGANIK" });
      const cleanIt = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: idLokasi });
      await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });

      const { data } = (await (await daftar("?jenis=CLEANIT")).json()) as { data: Laporan[] };

      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        idLaporan: cleanIt.idLaporan,
        jenis: "CLEANIT",
        lokasi: "Bantaran Teras",
        latitude: LAT,
        longitude: LNG,
        sumber: null,
        jenisSampah: "ORGANIK",
      });
    });

    it("mendukung filter status, sort terlama, dan pagination", async () => {
      const sekarang = Date.now();
      const id: number[] = [];
      for (let i = 5; i >= 1; i--) {
        id.push(
          (await buatLaporan({
            jenis: "REPORTIT",
            idPengguna: pelapor,
            status: "TIDAK_VALID",
            diverifikasiOleh: operator,
            createdAt: new Date(sekarang - i * MENIT),
          })).idLaporan,
        );
      }

      const res = await daftar("?status=TIDAK_VALID&sort=terlama&page=2&limit=2");
      const body = (await res.json()) as { data: Laporan[]; meta: unknown };

      expect(body.meta).toEqual({ page: 2, limit: 2, total: 5 });
      expect(body.data.map((l) => l.idLaporan)).toEqual([id[2], id[3]]);
    });

    it.each(["?jenis=SEMUA", "?status=SELESAI", "?sort=acak", "?page=0", "?limit=51", "?limit=1.5"])(
      "menolak query %s dengan 400 FORMAT_TIDAK_VALID",
      async (query) => {
        const res = await daftar(query);
        expect(res.status).toBe(400);
        expect((await res.json()).error.code).toBe("FORMAT_TIDAK_VALID");
      },
    );
  });

  describe("GET /api/laporan/:id", () => {
    it("ReportIt menunggu: media, pelapor, dan lokasiTerdekat dalam radius 50 m", async () => {
      const lokasi = await buatLokasi({ pelapor, operator, nama: "Bantaran Teras" });
      const { idLaporan } = await buatLaporan({
        jenis: "REPORTIT",
        idPengguna: pelapor,
        latitude: LAT + 0.00027, // ±30 m
        longitude: LNG,
      });
      const foto = await buatMedia({ idPengguna: pelapor, laporanId: idLaporan });

      const res = await detail(String(idLaporan));
      expect(res.status).toBe(200);
      const { data } = (await res.json()) as { data: LaporanDetail };

      expect(data).toMatchObject({
        idLaporan,
        jenis: "REPORTIT",
        status: "BELUM_DIPERIKSA",
        pelapor: { id: pelapor, nama: "Budi Santoso" },
        lokasiId: null,
        alasanPenolakan: null,
        lokasiTerdekat: { idLokasi: lokasi.idLokasi, nama: "Bantaran Teras", jarakMeter: 30 },
        laporanAsal: null,
        pelaporAsalSama: null,
        jumlahBersihkanSendiri30Hari: null,
      });
      expect(data.media).toHaveLength(1);
      expect(data.media[0].idMedia).toBe(foto.idMedia);
      expect(new URL(data.media[0].url).pathname).toBe(`/soclean-media/${foto.storageKey}`);
    });

    it("lokasiTerdekat null jika tidak ada lokasi TERCEMAR dalam 50 m atau laporan sudah diverifikasi", async () => {
      const jauh = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, latitude: LAT + 0.01, longitude: LNG });
      // Laporan asal lokasi ini VALID dan berada tepat di lokasi tersebut.
      const { idLaporanAsal } = await buatLokasi({ pelapor, operator });

      for (const id of [jauh.idLaporan, idLaporanAsal]) {
        const { data } = (await (await detail(String(id))).json()) as { data: LaporanDetail };
        expect(data.lokasiTerdekat).toBeNull();
      }
    });

    it("CleanIt: laporanAsal dengan media, tanda pelapor asal, dan jumlah 30 hari", async () => {
      const sari = (await buatPengguna({ nama: "Sari" })).id;
      const lokasi = await buatLokasi({ pelapor, operator, nama: "Bantaran Teras", judul: "Plastik di bantaran" });
      const fotoSebelum = await buatMedia({ idPengguna: pelapor, laporanId: lokasi.idLaporanAsal });
      const lokasiLain = await buatLokasi({ pelapor, operator, latitude: LAT + 0.001 });
      await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: lokasiLain.idLokasi });

      const sendiri = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: lokasi.idLokasi });
      const orangLain = await buatLaporan({ jenis: "CLEANIT", idPengguna: sari, lokasiId: lokasi.idLokasi });
      const fotoSesudah = await buatMedia({ idPengguna: pelapor, laporanId: sendiri.idLaporan });

      const { data } = (await (await detail(String(sendiri.idLaporan))).json()) as { data: LaporanDetail };
      expect(data).toMatchObject({
        jenis: "CLEANIT",
        lokasi: "Bantaran Teras",
        sumber: null,
        lokasiId: lokasi.idLokasi,
        lokasiTerdekat: null,
        pelaporAsalSama: true,
        jumlahBersihkanSendiri30Hari: 1,
      });
      expect(data.media.map((m) => m.idMedia)).toEqual([fotoSesudah.idMedia]);
      expect(data.laporanAsal).toMatchObject({ idLaporan: lokasi.idLaporanAsal, judul: "Plastik di bantaran" });
      expect(data.laporanAsal!.media.map((m) => m.idMedia)).toEqual([fotoSebelum.idMedia]);

      const lain = (await (await detail(String(orangLain.idLaporan))).json()) as { data: LaporanDetail };
      expect(lain.data).toMatchObject({ pelaporAsalSama: false, jumlahBersihkanSendiri30Hari: 0 });
    });

    it("ID tidak valid → 400, laporan tidak ada → 404", async () => {
      const salah = await detail("abc");
      expect(salah.status).toBe(400);
      expect((await salah.json()).error.fields).toHaveProperty("id");

      const tidakAda = await detail("4242");
      expect(tidakAda.status).toBe(404);
      expect((await tidakAda.json()).error.code).toBe("NOT_FOUND");
    });

    it("menolak tamu (401) dan Masyarakat (403)", async () => {
      const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
      expect((await detail(String(idLaporan), null)).status).toBe(401);
      expect((await detail(String(idLaporan), { id: pelapor, role: "MASYARAKAT" })).status).toBe(403);
    });
  });
});

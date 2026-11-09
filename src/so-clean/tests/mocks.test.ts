/**
 * Memastikan mock MSW (FE-04) berperilaku sesuai kontrak, lewat API client yang sama
 * dengan yang dipakai halaman.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../lib/api/client";
import {
  authApi,
  laporanApi,
  lokasiApi,
  mediaApi,
  notifikasiApi,
  penukaranApi,
  poinApi,
  rewardApi,
} from "../lib/api/endpoints";
import { PASSWORD_UJI, resetDb } from "../mocks/db";
import { server } from "../mocks/node";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
beforeEach(() => resetDb());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const MASYARAKAT = { email: "masyarakat@soclean.test", password: PASSWORD_UJI };
const OPERATOR = { email: "operator@soclean.test", password: PASSWORD_UJI };

async function kodeError(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error.code;
    throw error;
  }
  return "TIDAK_ADA_ERROR";
}

describe("mock auth", () => {
  it("login, /api/me, lalu logout", async () => {
    const pengguna = await authApi.login({ email: "  MASYARAKAT@soclean.test ", password: PASSWORD_UJI });
    expect(pengguna).toMatchObject({ nama: "Dapin Tampan", role: "MASYARAKAT" });
    await expect(authApi.me()).resolves.toMatchObject({ saldoPoin: 67 });
    await authApi.logout();
    expect(await kodeError(authApi.me())).toBe("UNAUTHORIZED");
  });

  it("login gagal memakai satu kode generik", async () => {
    expect(await kodeError(authApi.login({ ...MASYARAKAT, password: "salah12345" }))).toBe("LOGIN_GAGAL");
    expect(await kodeError(authApi.login({ email: "tidak@ada.test", password: PASSWORD_UJI }))).toBe(
      "LOGIN_GAGAL",
    );
  });

  it("register memvalidasi aturan akun dengan `fields`", async () => {
    try {
      await authApi.register({ nama: "", email: "bukan-email", password: "pendek" });
      throw new Error("Seharusnya gagal");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const e = error as ApiError;
      expect(e.code).toBe("FORMAT_TIDAK_VALID");
      expect(Object.keys(e.fields ?? {}).sort()).toEqual(["email", "nama", "password"]);
    }
  });

  it("register menolak email yang sudah terdaftar", async () => {
    const body = { nama: "Baru", email: "MASYARAKAT@soclean.test", password: "rahasia123" };
    expect(await kodeError(authApi.register(body))).toBe("EMAIL_TERDAFTAR");
  });

  it("register berhasil sebagai MASYARAKAT dan langsung login", async () => {
    const baru = await authApi.register({ nama: "Warga Baru", email: "baru@soclean.test", password: "rahasia123" });
    expect(baru.role).toBe("MASYARAKAT");
    await expect(authApi.me()).resolves.toMatchObject({ email: "baru@soclean.test", saldoPoin: 0 });
  });
});

describe("mock cek role", () => {
  it("tamu ditolak 401, role salah ditolak 403", async () => {
    expect(await kodeError(rewardApi.daftar())).toBe("UNAUTHORIZED");
    await authApi.login(MASYARAKAT);
    expect(await kodeError(laporanApi.daftar())).toBe("FORBIDDEN");
    await authApi.login(OPERATOR);
    expect(await kodeError(poinApi.saldo())).toBe("FORBIDDEN");
  });
});

describe("mock laporan (Operator)", () => {
  beforeEach(() => authApi.login(OPERATOR));

  it("daftar memakai default status BELUM_DIPERIKSA, limit 6, dan meta.total", async () => {
    const { data, meta } = await laporanApi.daftar();
    expect(meta).toMatchObject({ page: 1, limit: 6 });
    expect(meta.total).toBeGreaterThan(6);
    expect(data).toHaveLength(6);
    expect(data.every((l) => l.status === "BELUM_DIPERIKSA")).toBe(true);
  });

  it("detail ReportIt yang dekat lokasi TERCEMAR berisi lokasiTerdekat", async () => {
    const detail = await laporanApi.detail(6);
    expect(detail.lokasiTerdekat).toMatchObject({ idLokasi: 1 });
    expect(detail.lokasiTerdekat!.jarakMeter).toBeLessThanOrEqual(50);
    expect(detail.laporanAsal).toBeNull();
  });

  it("detail CleanIt berisi laporanAsal dan tanda pelapor asal", async () => {
    const detail = await laporanApi.detail(8);
    expect(detail.laporanAsal?.idLaporan).toBe(1);
    expect(detail.laporanAsal?.media.length).toBeGreaterThan(0);
    expect(detail.pelaporAsalSama).toBe(true);
    expect(detail.lokasiTerdekat).toBeNull();
  });

  it("setujui ReportIt di dalam radius 50 m digabung ke lokasi yang ada", async () => {
    await expect(laporanApi.setujui(6, { poin: 200 })).resolves.toMatchObject({
      status: "VALID",
      idLokasi: 1,
      digabung: true,
    });
  });

  it("setujui ReportIt baru membuat lokasi dan menolak poin di luar 50/100/200", async () => {
    expect(await kodeError(laporanApi.setujui(7, { poin: 75 as never }))).toBe("FORMAT_TIDAK_VALID");
    const hasil = await laporanApi.setujui(7, { poin: 100, namaLokasi: "Karang Timur" });
    expect(hasil.digabung).toBe(false);
    await authApi.login(MASYARAKAT);
    const lokasi = await lokasiApi.detail(hasil.idLokasi!);
    expect(lokasi).toMatchObject({ nama: "Karang Timur", poin: 100, status: "TERCEMAR" });
  });

  it("verifikasi ganda ditolak SUDAH_DIVERIFIKASI", async () => {
    await laporanApi.tolak(7, { alasan: "Duplikat" });
    expect(await kodeError(laporanApi.setujui(7))).toBe("SUDAH_DIVERIFIKASI");
  });

  it("tolak CleanIt wajib alasan", async () => {
    expect(await kodeError(laporanApi.tolak(8))).toBe("DATA_TIDAK_LENGKAP");
  });

  it("setujui CleanIt memberi poin dan menolak CleanIt lain untuk lokasi yang sama", async () => {
    await expect(laporanApi.setujui(9)).resolves.toMatchObject({ status: "VALID", poinDiberikan: 50 });
    expect(await kodeError(laporanApi.setujui(9))).toBe("SUDAH_DIVERIFIKASI");
  });

  it("laporan yang tidak ada → NOT_FOUND", async () => {
    expect(await kodeError(laporanApi.detail(9999))).toBe("NOT_FOUND");
  });
});

describe("mock laporan (Masyarakat)", () => {
  beforeEach(() => authApi.login(MASYARAKAT));

  const foto = () => new File(["isi foto"], "foto.jpg", { type: "image/jpeg" });

  it("upload media menolak tipe file yang tidak didukung", async () => {
    const gif = new File(["gif"], "a.gif", { type: "image/gif" });
    expect(await kodeError(mediaApi.upload(gif))).toBe("TIPE_FILE_TIDAK_DIDUKUNG");
  });

  it("buat ReportIt di dalam wilayah", async () => {
    const { idMedia } = await mediaApi.upload(foto());
    const hasil = await laporanApi.buat({
      jenis: "REPORTIT",
      judul: "Sampah plastik",
      waktu: "2026-11-01T03:00:00Z",
      idMedia: [idMedia],
      lokasi: "Teras Cikapundung",
      latitude: -6.89,
      longitude: 107.606,
      sumber: "PENGAMATAN_PRIBADI",
      jenisSampah: "PLASTIK",
    });
    expect(hasil.status).toBe("BELUM_DIPERIKSA");
    // Media yang sudah tertaut tidak boleh dipakai lagi.
    expect(
      await kodeError(
        laporanApi.buat({
          jenis: "REPORTIT", judul: "Lagi", waktu: "2026-11-01T03:00:00Z", idMedia: [idMedia],
          lokasi: "X", latitude: -6.89, longitude: 107.606, sumber: "LAINNYA", jenisSampah: "LAINNYA",
        }),
      ),
    ).toBe("MEDIA_SUDAH_DIGUNAKAN");
  });

  it("ReportIt di luar wilayah → DI_LUAR_WILAYAH, field kosong → DATA_TIDAK_LENGKAP", async () => {
    const { idMedia } = await mediaApi.upload(foto());
    const dasar = {
      jenis: "REPORTIT" as const, judul: "Sampah", waktu: "2026-11-01T03:00:00Z", idMedia: [idMedia],
      lokasi: "Monas", sumber: "LAINNYA" as const, jenisSampah: "LAINNYA" as const,
    };
    expect(await kodeError(laporanApi.buat({ ...dasar, latitude: -6.175, longitude: 106.827 }))).toBe(
      "DI_LUAR_WILAYAH",
    );
    expect(await kodeError(laporanApi.buat({ ...dasar, judul: "", latitude: -6.89, longitude: 107.606 }))).toBe(
      "DATA_TIDAK_LENGKAP",
    );
  });

  it("CleanIt mengikuti aturan lokasi DIBERSIHKAN dan satu CleanIt menunggu", async () => {
    const m1 = await mediaApi.upload(foto());
    const waktu = new Date().toISOString();
    expect(
      await kodeError(laporanApi.buat({ jenis: "CLEANIT", judul: "Bersih", waktu, idMedia: [m1.idMedia], lokasiId: 3 })),
    ).toBe("LOKASI_SUDAH_DIBERSIHKAN");
    // Dapin sudah punya CleanIt menunggu untuk lokasi 2 (laporan 9).
    expect(
      await kodeError(laporanApi.buat({ jenis: "CLEANIT", judul: "Bersih", waktu, idMedia: [m1.idMedia], lokasiId: 2 })),
    ).toBe("CLEANIT_SUDAH_MENUNGGU");
    await expect(
      laporanApi.buat({ jenis: "CLEANIT", judul: "Bersih", waktu, idMedia: [m1.idMedia], lokasiId: 4 }),
    ).resolves.toMatchObject({ status: "BELUM_DIPERIKSA" });
  });

  it("lokasi default hanya yang TERCEMAR", async () => {
    const lokasi = await lokasiApi.daftar();
    expect(lokasi.length).toBeGreaterThan(0);
    expect(lokasi.every((l) => l.status === "TERCEMAR")).toBe(true);
  });
});

describe("mock reward dan penukaran", () => {
  beforeEach(() => authApi.login(MASYARAKAT));

  it("reward diurutkan stok > 0 dulu lalu harga naik", async () => {
    const reward = await rewardApi.daftar();
    const habis = reward.findIndex((r) => r.stok === 0);
    expect(reward.slice(habis).every((r) => r.stok === 0)).toBe(true);
    const tersedia = reward.slice(0, habis).map((r) => r.hargaPoin);
    expect(tersedia).toEqual([...tersedia].sort((a, b) => a - b));
  });

  it("penukaran berhasil mengurangi saldo dan membuat voucher SC-XXXX-XXXX", async () => {
    const hasil = await penukaranApi.tukar({ idReward: 5 });
    expect(hasil.kodeVoucher).toMatch(/^SC-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    expect(hasil.sisaPoin).toBe(47);
    await expect(poinApi.saldo()).resolves.toEqual({ saldoPoin: 47 });
    const { data, meta } = await penukaranApi.riwayat();
    expect(meta.total).toBe(2);
    expect(data[0].kodeVoucher).toBe(hasil.kodeVoucher);
  });

  it("STOK_HABIS dan POIN_TIDAK_CUKUP", async () => {
    expect(await kodeError(penukaranApi.tukar({ idReward: 3 }))).toBe("STOK_HABIS");
    expect(await kodeError(penukaranApi.tukar({ idReward: 4 }))).toBe("POIN_TIDAK_CUKUP");
    expect(await kodeError(penukaranApi.tukar({ idReward: 999 }))).toBe("NOT_FOUND");
  });
});

describe("mock notifikasi", () => {
  beforeEach(() => authApi.login(MASYARAKAT));

  it("diturunkan dari laporan terverifikasi dan bisa ditandai dibaca", async () => {
    const notifikasi = await notifikasiApi.daftar();
    expect(notifikasi.length).toBeGreaterThan(0);
    const cleanIt = notifikasi.find((n) => n.jenis === "CLEANIT" && n.status === "VALID");
    expect(cleanIt?.poinDiberikan).toBe(200);
    const ditolak = notifikasi.find((n) => n.status === "TIDAK_VALID");
    expect(ditolak?.alasanPenolakan).toBeTruthy();
    expect(notifikasi.some((n) => !n.dibaca)).toBe(true);

    await notifikasiApi.tandaiDibaca();
    const sesudah = await notifikasiApi.daftar();
    expect(sesudah.every((n) => n.dibaca)).toBe(true);
  });
});

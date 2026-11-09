import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/notifikasi/route";
import { POST } from "@/app/api/notifikasi/dibaca/route";
import { db } from "@/server/db";
import { pengguna } from "@/server/db/schema";
import type { Notifikasi, Role } from "@/types/api";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatPengguna,
  kosongkanDatabase,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const T1 = new Date("2026-11-01T03:00:00Z");
const T2 = new Date("2026-11-02T03:00:00Z");
const T3 = new Date("2026-11-03T03:00:00Z");
const T4 = new Date("2026-11-04T03:00:00Z");

async function daftar(idPengguna: string | null, role: Role = "MASYARAKAT") {
  const cookie = idPengguna ? await cookieSesi(idPengguna, role) : undefined;
  return GET(buatRequest("/api/notifikasi", { cookie }));
}

async function dibaca(idPengguna: string | null, role: Role = "MASYARAKAT") {
  const cookie = idPengguna ? await cookieSesi(idPengguna, role) : undefined;
  return POST(buatRequest("/api/notifikasi/dibaca", { method: "POST", cookie }));
}

/**
 * Budi: ReportIt VALID (T1), ReportIt TIDAK_VALID (T2), CleanIt VALID di lokasi 200 poin (T3),
 * CleanIt TIDAK_VALID (T4), dan satu ReportIt yang belum diperiksa.
 */
async function siapkanLaporanBudi(budi: string) {
  const operator = (await buatPengguna({ role: "OPERATOR" })).id;
  const sari = (await buatPengguna()).id;

  const lokasiBudi = await buatLokasi({
    pelapor: budi,
    operator,
    judul: "Plastik di Teras Cikapundung",
    dilaporkanAt: T1,
  });
  const lokasiSari = await buatLokasi({ pelapor: sari, operator, poin: 200 });

  const reportItDitolak = await buatLaporan({
    jenis: "REPORTIT",
    idPengguna: budi,
    judul: "Laporan ganda",
    status: "TIDAK_VALID",
    diverifikasiOleh: operator,
    diverifikasiAt: T2,
  });
  const cleanItValid = await buatLaporan({
    jenis: "CLEANIT",
    idPengguna: budi,
    judul: "Pembersihan lokasi Sari",
    lokasiId: lokasiSari.idLokasi,
    status: "VALID",
    diverifikasiOleh: operator,
    diverifikasiAt: T3,
  });
  const cleanItDitolak = await buatLaporan({
    jenis: "CLEANIT",
    idPengguna: budi,
    judul: "Pembersihan lokasi sendiri",
    lokasiId: lokasiBudi.idLokasi,
    status: "TIDAK_VALID",
    alasanPenolakan: "Foto sesudah tidak jelas",
    diverifikasiOleh: operator,
    diverifikasiAt: T4,
  });
  await buatLaporan({ jenis: "REPORTIT", idPengguna: budi, judul: "Masih menunggu" });

  return {
    reportItValid: lokasiBudi.idLaporanAsal,
    reportItDitolak: reportItDitolak.idLaporan,
    cleanItValid: cleanItValid.idLaporan,
    cleanItDitolak: cleanItDitolak.idLaporan,
  };
}

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/notifikasi dan POST /api/notifikasi/dibaca", () => {
  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
  });

  it("menurunkan notifikasi dari laporan terverifikasi milik pengguna, urut terbaru", async () => {
    const budi = (await buatPengguna()).id;
    const id = await siapkanLaporanBudi(budi);

    const res = await daftar(budi);
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: Notifikasi[] };

    expect(data).toEqual([
      {
        idLaporan: id.cleanItDitolak,
        jenis: "CLEANIT",
        judul: "Pembersihan lokasi sendiri",
        status: "TIDAK_VALID",
        alasanPenolakan: "Foto sesudah tidak jelas",
        poinDiberikan: null,
        waktu: T4.toISOString(),
        dibaca: false,
      },
      {
        idLaporan: id.cleanItValid,
        jenis: "CLEANIT",
        judul: "Pembersihan lokasi Sari",
        status: "VALID",
        alasanPenolakan: null,
        poinDiberikan: 200,
        waktu: T3.toISOString(),
        dibaca: false,
      },
      expect.objectContaining({
        idLaporan: id.reportItDitolak,
        jenis: "REPORTIT",
        status: "TIDAK_VALID",
        poinDiberikan: null,
        waktu: T2.toISOString(),
      }),
      expect.objectContaining({
        idLaporan: id.reportItValid,
        jenis: "REPORTIT",
        judul: "Plastik di Teras Cikapundung",
        status: "VALID",
        // ReportIt tidak mendapat poin walaupun lokasinya punya poin (N1).
        poinDiberikan: null,
        waktu: T1.toISOString(),
      }),
    ]);
  });

  it("dibaca hanya untuk notifikasi yang diverifikasi sebelum notifikasi_dilihat_at", async () => {
    const budi = (await buatPengguna({ notifikasiDilihatAt: new Date("2026-11-02T12:00:00Z") })).id;
    const id = await siapkanLaporanBudi(budi);

    const { data } = (await (await daftar(budi)).json()) as { data: Notifikasi[] };
    const status = Object.fromEntries(data.map((n) => [n.idLaporan, n.dibaca]));

    expect(status).toEqual({
      [id.cleanItDitolak]: false,
      [id.cleanItValid]: false,
      [id.reportItDitolak]: true,
      [id.reportItValid]: true,
    });
  });

  it("POST dibaca menandai semua notifikasi dibaca; verifikasi berikutnya belum dibaca", async () => {
    const budi = (await buatPengguna()).id;
    await siapkanLaporanBudi(budi);

    const res = await dibaca(budi);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { ok: true } });

    const [row] = await db
      .select({ dilihat: pengguna.notifikasiDilihatAt })
      .from(pengguna)
      .where(eq(pengguna.id, budi));
    expect(row.dilihat).toBeInstanceOf(Date);

    const sesudah = (await (await daftar(budi)).json()) as { data: Notifikasi[] };
    expect(sesudah.data.every((n) => n.dibaca)).toBe(true);

    const operator = (await buatPengguna({ role: "OPERATOR" })).id;
    const baru = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: budi,
      status: "VALID",
      diverifikasiOleh: operator,
      diverifikasiAt: new Date(Date.now() + 60_000),
    });
    const terbaru = (await (await daftar(budi)).json()) as { data: Notifikasi[] };
    expect(terbaru.data[0]).toMatchObject({ idLaporan: baru.idLaporan, dibaca: false });
  });

  it("mengembalikan list kosong untuk pengguna tanpa laporan terverifikasi", async () => {
    const budi = (await buatPengguna()).id;
    await buatLaporan({ jenis: "REPORTIT", idPengguna: budi });
    expect(await (await daftar(budi)).json()).toEqual({ data: [] });
  });

  it("menolak tamu (401) dan Operator (403) di kedua endpoint", async () => {
    const operator = (await buatPengguna({ role: "OPERATOR" })).id;

    expect((await daftar(null)).status).toBe(401);
    expect((await dibaca(null)).status).toBe(401);
    expect((await daftar(operator, "OPERATOR")).status).toBe(403);

    const res = await dibaca(operator, "OPERATOR");
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });
});

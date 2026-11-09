import { count, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/laporan/route";
import { db } from "@/server/db";
import { laporan, media } from "@/server/db/schema";
import * as MediaModel from "@/server/models/media";
import {
  DATABASE_TEST_AKTIF,
  buatLokasi,
  buatMedia,
  buatPengguna,
  buatLaporan,
  kosongkanDatabase,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const WAKTU_KEJADIAN = () => new Date(Date.now() - 30 * 60 * 1000).toISOString();

function reportIt(idMedia: number[], overrides: Record<string, unknown> = {}) {
  return {
    jenis: "REPORTIT",
    judul: "Sampah di tepi sungai",
    waktu: WAKTU_KEJADIAN(),
    lokasi: "Jl. Uji No. 1",
    latitude: -6.885,
    longitude: 107.6065,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    idMedia,
    ...overrides,
  };
}

function cleanIt(lokasiId: number, idMedia: number[], overrides: Record<string, unknown> = {}) {
  return {
    jenis: "CLEANIT",
    judul: "Pembersihan lokasi",
    waktu: WAKTU_KEJADIAN(),
    lokasiId,
    idMedia,
    ...overrides,
  };
}

async function buatMediaDenganHash(idPengguna: string, sha256: string, laporanId: number | null = null) {
  const [row] = await db
    .insert(media)
    .values({
      idPengguna,
      laporanId,
      storageKey: `uji/api-laporan-${crypto.randomUUID()}`,
      tipe: "FOTO",
      ukuranByte: 128,
      sha256,
    })
    .returning({ id: media.id });
  return row.id;
}

describe.runIf(DATABASE_TEST_AKTIF)("POST /api/laporan", () => {
  let idPengguna: string;
  let idOperator: string;
  let cookieMasyarakat: string;
  let cookieOperator: string;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    await kosongkanDatabase();
    idPengguna = (await buatPengguna()).id;
    idOperator = (await buatPengguna({ role: "OPERATOR" })).id;
    cookieMasyarakat = await cookieSesi(idPengguna, "MASYARAKAT");
    cookieOperator = await cookieSesi(idOperator, "OPERATOR");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function kirim(body: unknown, cookie = cookieMasyarakat) {
    return POST(buatRequest("/api/laporan", { method: "POST", cookie, body }));
  }

  it("menolak tamu dan Operator sebelum membuat laporan", async () => {
    const tamu = await POST(buatRequest("/api/laporan", { method: "POST", body: reportIt([1]) }));
    expect(tamu.status).toBe(401);
    expect((await tamu.json()).error.code).toBe("UNAUTHORIZED");

    const operator = await kirim(reportIt([1]), cookieOperator);
    expect(operator.status).toBe(403);
    expect((await operator.json()).error.code).toBe("FORBIDDEN");
    await expect(db.select({ total: count() }).from(laporan)).resolves.toEqual([{ total: 0 }]);
  });

  it("membuat ReportIt, menautkan media, dan mengembalikan respons kontrak", async () => {
    const bukti = await buatMedia({ idPengguna, laporanId: null });
    const response = await kirim(reportIt([bukti.idMedia]));

    expect(response.status).toBe(201);
    const { data } = await response.json();
    expect(Object.keys(data).sort()).toEqual(["idLaporan", "status"]);
    expect(data).toMatchObject({ idLaporan: expect.any(Number), status: "BELUM_DIPERIKSA" });

    const [row] = await db.select().from(laporan).where(eq(laporan.id, data.idLaporan));
    expect(row).toMatchObject({
      jenis: "REPORTIT",
      idPengguna,
      judul: "Sampah di tepi sungai",
      lokasiTeks: "Jl. Uji No. 1",
      latitude: -6.885,
      longitude: 107.6065,
      sumber: "PENGAMATAN_PRIBADI",
      jenisSampah: "PLASTIK",
      lokasiId: null,
      status: "BELUM_DIPERIKSA",
      diverifikasiAt: null,
      diverifikasiOleh: null,
    });
    const [mediaTertaut] = await db.select().from(media).where(eq(media.id, bukti.idMedia));
    expect(mediaTertaut.laporanId).toBe(data.idLaporan);
  });

  it("membuat CleanIt, mengabaikan field ReportIt, dan menautkan media atomik", async () => {
    const operator = idOperator;
    const { idLokasi } = await buatLokasi({
      pelapor: idPengguna,
      operator,
      waktuKejadian: new Date(Date.now() - 60 * 60 * 1000),
    });
    const bukti = await buatMedia({ idPengguna, laporanId: null });
    const response = await kirim(
      cleanIt(idLokasi, [bukti.idMedia], {
        lokasi: "diabaikan",
        latitude: 999,
        longitude: 999,
        sumber: "INVALID",
        jenisSampah: "INVALID",
      }),
    );

    expect(response.status).toBe(201);
    const { data } = await response.json();
    const [row] = await db.select().from(laporan).where(eq(laporan.id, data.idLaporan));
    expect(row).toMatchObject({
      jenis: "CLEANIT",
      idPengguna,
      lokasiId: idLokasi,
      lokasiTeks: null,
      latitude: null,
      longitude: null,
      sumber: null,
      jenisSampah: null,
      status: "BELUM_DIPERIKSA",
    });
    const [mediaTertaut] = await db.select().from(media).where(eq(media.id, bukti.idMedia));
    expect(mediaTertaut.laporanId).toBe(data.idLaporan);
  });

  it("mengembalikan kode error BE-10 tanpa menulis baris", async () => {
    const kosong = await kirim({});
    expect(kosong.status).toBe(400);
    expect((await kosong.json()).error.code).toBe("DATA_TIDAK_LENGKAP");

    const luarWilayah = await kirim(reportIt([1], { latitude: -6.5, longitude: 107.5 }));
    expect(luarWilayah.status).toBe(422);
    expect((await luarWilayah.json()).error.code).toBe("DI_LUAR_WILAYAH");

    const tidakAdaMedia = await kirim(reportIt([999999]));
    expect(tidakAdaMedia.status).toBe(400);
    expect((await tidakAdaMedia.json()).error.code).toBe("FORMAT_TIDAK_VALID");

    const lokasiTidakAda = await kirim(cleanIt(999999, [1]));
    expect(lokasiTidakAda.status).toBe(404);
    expect((await lokasiTidakAda.json()).error.code).toBe("NOT_FOUND");
    await expect(db.select({ total: count() }).from(laporan)).resolves.toEqual([{ total: 0 }]);
  });

  it("menolak media yang sudah digunakan dan mempertahankan tautan laporan sebelumnya", async () => {
    const laporanSebelumnya = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna,
      status: "VALID",
      diverifikasiOleh: idOperator,
    });
    const hash = "a".repeat(64);
    const buktiTerpakai = await buatMediaDenganHash(idPengguna, hash, laporanSebelumnya.idLaporan);
    const buktiUnggahUlang = await buatMediaDenganHash(idPengguna, hash);

    const response = await kirim(reportIt([buktiUnggahUlang]));
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("MEDIA_SUDAH_DIGUNAKAN");

    const [barisTerpakai] = await db.select().from(media).where(eq(media.id, buktiTerpakai));
    const [barisUnggahUlang] = await db.select().from(media).where(eq(media.id, buktiUnggahUlang));
    expect(barisTerpakai.laporanId).toBe(laporanSebelumnya.idLaporan);
    expect(barisUnggahUlang.laporanId).toBeNull();
  });

  it("me-rollback pembuatan laporan jika jumlah media tertaut tidak sama", async () => {
    const bukti = await buatMedia({ idPengguna, laporanId: null });
    vi.spyOn(MediaModel, "tautkanKeLaporan").mockResolvedValue(0);

    const response = await kirim(reportIt([bukti.idMedia]));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("FORMAT_TIDAK_VALID");
    await expect(db.select({ total: count() }).from(laporan).where(eq(laporan.idPengguna, idPengguna))).resolves.toEqual([
      { total: 0 },
    ]);
    const [mediaTidakTertaut] = await db.select().from(media).where(eq(media.id, bukti.idMedia));
    expect(mediaTidakTertaut.laporanId).toBeNull();
  });

  it("memenangkan satu dari dua CleanIt serentak dan memetakan konflik unique index", async () => {
    const { idLokasi } = await buatLokasi({
      pelapor: idPengguna,
      operator: idOperator,
      waktuKejadian: new Date(Date.now() - 60 * 60 * 1000),
    });
    const bukti1 = await buatMedia({ idPengguna, laporanId: null });
    const bukti2 = await buatMedia({ idPengguna, laporanId: null });

    const [response1, response2] = await Promise.all([
      kirim(cleanIt(idLokasi, [bukti1.idMedia])),
      kirim(cleanIt(idLokasi, [bukti2.idMedia])),
    ]);
    const responses = [response1, response2];
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    const conflict = responses.find((response) => response.status === 409)!;
    expect((await conflict.json()).error.code).toBe("CLEANIT_SUDAH_MENUNGGU");

    const rows = await db.select().from(laporan).where(eq(laporan.jenis, "CLEANIT"));
    expect(rows).toHaveLength(1);
    const mediaRows = await db.select().from(media).where(eq(media.idPengguna, idPengguna));
    expect(mediaRows.filter(({ laporanId }) => laporanId !== null)).toHaveLength(1);
  });
});

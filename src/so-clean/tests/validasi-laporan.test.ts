import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { cek_laporan, is_format_valid, is_terisi } from "@/server/controllers/manager-laporan";
import { db } from "@/server/db";
import { media } from "@/server/db/schema";
import { DATABASE_TEST_AKTIF, buatLokasi, buatLaporan, buatPengguna, kosongkanDatabase } from "./helpers/db";

const SEKARANG = new Date("2026-11-09T12:00:00.000Z");
const WAKTU_VALID = "2026-11-09T10:00:00.000Z";

function inputReportIt(overrides: Record<string, unknown> = {}) {
  return {
    jenis: "REPORTIT",
    judul: "Sampah di tepi sungai",
    waktu: WAKTU_VALID,
    idMedia: [1],
    lokasi: "Jl. Uji No. 1",
    latitude: -6.885,
    longitude: 107.6065,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    ...overrides,
  };
}

function inputCleanIt(lokasiId: number, overrides: Record<string, unknown> = {}) {
  return {
    jenis: "CLEANIT",
    judul: "Pembersihan lokasi",
    waktu: WAKTU_VALID,
    idMedia: [1],
    lokasiId,
    ...overrides,
  };
}

async function buatMediaDenganHash(idPengguna: string, sha256: string, laporanId: number | null = null) {
  const [row] = await db
    .insert(media)
    .values({
      idPengguna,
      laporanId,
      storageKey: `uji/validasi-${randomUUID()}`,
      tipe: "FOTO",
      ukuranByte: 100,
      sha256,
    })
    .returning({ id: media.id });
  return row.id;
}

describe("is_terisi dan is_format_valid", () => {
  it("membedakan field wajib kosong dari nilai yang formatnya salah", () => {
    expect(is_terisi(inputReportIt())).toBe(true);
    expect(is_terisi(inputReportIt({ idMedia: [] }))).toBe(false);
    expect(is_terisi(inputReportIt({ lokasi: "  " }))).toBe(false);
    expect(is_terisi({})).toBe(false);

    expect(is_format_valid(inputReportIt(), SEKARANG)).toBe(true);
    expect(is_format_valid(inputReportIt({ judul: "x".repeat(81) }), SEKARANG)).toBe(false);
    expect(is_format_valid(inputReportIt({ waktu: "bukan-waktu" }), SEKARANG)).toBe(false);
    expect(is_format_valid(inputReportIt({ waktu: "2026-11-09T12:00:01.000Z" }), SEKARANG)).toBe(false);
    expect(is_format_valid(inputReportIt({ latitude: 91 }), SEKARANG)).toBe(false);
    expect(is_format_valid(inputReportIt({ idMedia: [1, 2, 3, 4] }), SEKARANG)).toBe(false);
  });
});

describe.runIf(DATABASE_TEST_AKTIF)("validasi laporan (BE-10)", () => {
  let idPengguna: string;
  let idPenggunaLain: string;
  let idOperator: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    idPengguna = (await buatPengguna()).id;
    idPenggunaLain = (await buatPengguna()).id;
    idOperator = (await buatPengguna({ role: "OPERATOR" })).id;
  });

  it("memetakan field kosong ke DATA_TIDAK_LENGKAP dan format salah ke FORMAT_TIDAK_VALID", async () => {
    await expect(cek_laporan(inputReportIt({ idMedia: [] }), idPengguna, db, SEKARANG)).rejects.toMatchObject({
      code: "DATA_TIDAK_LENGKAP",
      status: 400,
      fields: { idMedia: expect.any(String) },
    });

    await expect(cek_laporan(inputReportIt({ latitude: "-6.885" }), idPengguna, db, SEKARANG)).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
      status: 400,
      fields: { latitude: expect.any(String) },
    });
    await expect(cek_laporan({ ...inputReportIt(), jenis: "UNKNOWN" }, idPengguna, db, SEKARANG)).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
      status: 400,
    });
  });

  it("memvalidasi batas judul/waktu dan membedakan koordinat di luar wilayah", async () => {
    await expect(
      cek_laporan(inputReportIt({ waktu: "2026-11-09T12:00:01.000Z" }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { waktu: expect.any(String) } });
    await expect(
      cek_laporan(inputReportIt({ judul: "x".repeat(81) }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { judul: expect.any(String) } });
    await expect(
      cek_laporan(inputReportIt({ latitude: -6.5, longitude: 107.5 }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "DI_LUAR_WILAYAH", status: 422 });
  });

  it("menerima ReportIt valid dan membersihkan teks judul/lokasi", async () => {
    const idMedia = await buatMediaDenganHash(idPengguna, "a".repeat(64));
    const result = await cek_laporan(
      inputReportIt({ idMedia: [idMedia], judul: "  Judul laporan  ", lokasi: "  Jalan Uji  " }),
      idPengguna,
      db,
      SEKARANG,
    );

    expect(result).toMatchObject({
      jenis: "REPORTIT",
      idPengguna,
      judul: "Judul laporan",
      lokasi: "Jalan Uji",
      idMedia: [idMedia],
      waktu: new Date(WAKTU_VALID),
    });
  });

  it("membatasi jumlah media 1–3, memeriksa kepemilikan, dan hanya menerima media belum tertaut", async () => {
    await expect(
      cek_laporan(inputReportIt({ idMedia: [1, 2, 3, 4] }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { idMedia: expect.any(String) } });
    await expect(
      cek_laporan(inputReportIt({ idMedia: [999999] }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { idMedia: expect.any(String) } });

    const milikPenggunaLain = await buatMediaDenganHash(idPenggunaLain, "b".repeat(64));
    await expect(
      cek_laporan(inputReportIt({ idMedia: [milikPenggunaLain] }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { idMedia: expect.any(String) } });

    const laporanTertaut = await buatLaporan({ jenis: "REPORTIT", idPengguna, status: "VALID", diverifikasiOleh: idOperator });
    const mediaTertaut = await buatMediaDenganHash(idPengguna, "c".repeat(64), laporanTertaut.idLaporan);
    await expect(
      cek_laporan(inputReportIt({ idMedia: [mediaTertaut] }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "MEDIA_SUDAH_DIGUNAKAN", status: 409 });
  });

  it("menolak hash yang sudah dipakai laporan aktif, tetapi mengabaikan laporan TIDAK_VALID", async () => {
    const laporanAktif = await buatLaporan({ jenis: "REPORTIT", idPengguna, status: "VALID", diverifikasiOleh: idOperator });
    const hashAktif = "d".repeat(64);
    await buatMediaDenganHash(idPengguna, hashAktif, laporanAktif.idLaporan);
    const mediaUlang = await buatMediaDenganHash(idPengguna, hashAktif);
    await expect(
      cek_laporan(inputReportIt({ idMedia: [mediaUlang] }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "MEDIA_SUDAH_DIGUNAKAN", status: 409 });

    const laporanDitolak = await buatLaporan({ jenis: "REPORTIT", idPengguna, status: "TIDAK_VALID", diverifikasiOleh: idOperator });
    const hashDitolak = "e".repeat(64);
    await buatMediaDenganHash(idPengguna, hashDitolak, laporanDitolak.idLaporan);
    const mediaUnggahUlang = await buatMediaDenganHash(idPengguna, hashDitolak);
    await expect(
      cek_laporan(inputReportIt({ idMedia: [mediaUnggahUlang] }), idPengguna, db, SEKARANG),
    ).resolves.toMatchObject({ idMedia: [mediaUnggahUlang] });
  });

  it("membersihkan CleanIt: lokasi ada dan tercemar, waktu tidak sebelum laporan asal, pelapor asal boleh", async () => {
    const { idLokasi } = await buatLokasi({
      pelapor: idPengguna,
      operator: idOperator,
      waktuKejadian: new Date("2026-11-09T09:00:00.000Z"),
      dilaporkanAt: new Date("2026-11-09T10:00:00.000Z"),
    });
    const idMedia = await buatMediaDenganHash(idPengguna, "f".repeat(64));

    await expect(
      db.transaction((tx) => cek_laporan(
        inputCleanIt(idLokasi, {
          idMedia: [idMedia],
          waktu: "2026-11-09T09:00:00.000Z",
          lokasi: "ignored for CleanIt",
          latitude: 999,
          sumber: "IGNORED",
          jenisSampah: "IGNORED",
        }),
        idPengguna,
        tx,
        SEKARANG,
      )),
    ).resolves.toMatchObject({ jenis: "CLEANIT", idPengguna, lokasiId: idLokasi, idMedia: [idMedia] });

    await expect(
      cek_laporan(inputCleanIt(idLokasi, { idMedia: [idMedia], waktu: "2026-11-09T08:59:59.000Z" }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { waktu: expect.any(String) } });
    await expect(
      cek_laporan(inputCleanIt(idLokasi, { idMedia: [idMedia], waktu: "2026-11-09T12:00:01.000Z" }), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID", fields: { waktu: expect.any(String) } });
  });

  it("memetakan lokasi tidak ada, lokasi selesai, dan CleanIt menunggu ke error kontrak", async () => {
    await expect(
      cek_laporan(inputCleanIt(999999), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });

    const opsiWaktuAsal = {
      waktuKejadian: new Date("2026-11-09T09:00:00.000Z"),
      dilaporkanAt: new Date("2026-11-09T10:00:00.000Z"),
    };
    const selesai = await buatLokasi({
      pelapor: idPengguna,
      operator: idOperator,
      status: "DIBERSIHKAN",
      ...opsiWaktuAsal,
    });
    await expect(
      cek_laporan(inputCleanIt(selesai.idLokasi), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "LOKASI_SUDAH_DIBERSIHKAN", status: 409 });

    const tercemar = await buatLokasi({ pelapor: idPengguna, operator: idOperator, ...opsiWaktuAsal });
    await buatLaporan({ jenis: "CLEANIT", idPengguna, lokasiId: tercemar.idLokasi });
    await expect(
      cek_laporan(inputCleanIt(tercemar.idLokasi), idPengguna, db, SEKARANG),
    ).rejects.toMatchObject({ code: "CLEANIT_SUDAH_MENUNGGU", status: 409 });

    const mediaPenggunaLain = await buatMediaDenganHash(idPenggunaLain, "9".repeat(64));
    await expect(
      cek_laporan(inputCleanIt(tercemar.idLokasi, { idMedia: [mediaPenggunaLain] }), idPenggunaLain, db, SEKARANG),
    ).resolves.toMatchObject({ jenis: "CLEANIT", idPengguna: idPenggunaLain });
  });
});

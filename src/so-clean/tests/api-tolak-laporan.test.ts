import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/laporan/[id]/tolak/route";
import { db } from "@/server/db";
import { laporan, lokasi } from "@/server/db/schema";
import { getNotifikasi } from "@/server/models/pengguna";
import type { Role } from "@/types/api";
import { DATABASE_TEST_AKTIF, buatLaporan, buatLokasi, buatPengguna, kosongkanDatabase } from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

let operator: string;

async function tolak(
  id: number | string,
  body?: unknown,
  sebagai: { id: string; role: Role } | null = { id: operator, role: "OPERATOR" },
) {
  const cookie = sebagai ? await cookieSesi(sebagai.id, sebagai.role) : undefined;
  const request = buatRequest(`/api/laporan/${id}/tolak`, { method: "POST", cookie, body });
  return POST(request, { params: Promise.resolve({ id: String(id) }) });
}

async function getLaporan(id: number) {
  const [row] = await db.select().from(laporan).where(eq(laporan.id, id));
  return row;
}

describe.runIf(DATABASE_TEST_AKTIF)("POST /api/laporan/:id/tolak (BE-15)", () => {
  let pelapor: string;
  let idLokasi: number;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    pelapor = (await buatPengguna()).id;
    idLokasi = (await buatLokasi({ pelapor, operator })).idLokasi;
  });

  it("menolak ReportIt tanpa alasan", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });

    const res = await tolak(idLaporan);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { idLaporan, status: "TIDAK_VALID" } });
    const row = await getLaporan(idLaporan);
    expect(row).toMatchObject({ status: "TIDAK_VALID", alasanPenolakan: null, diverifikasiOleh: operator });
    expect(row.diverifikasiAt).toBeInstanceOf(Date);
  });

  it("menyimpan alasan ReportIt yang diisi setelah di-trim", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    expect((await tolak(idLaporan, { alasan: "  Lokasi di luar area pantauan  " })).status).toBe(200);
    expect((await getLaporan(idLaporan)).alasanPenolakan).toBe("Lokasi di luar area pantauan");
  });

  it("menolak CleanIt dengan alasan; lokasi tetap TERCEMAR dan notifikasi memuat alasannya", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: idLokasi });

    expect((await tolak(idLaporan, { alasan: "Foto sesudah tidak jelas" })).status).toBe(200);

    expect(await getLaporan(idLaporan)).toMatchObject({
      status: "TIDAK_VALID",
      alasanPenolakan: "Foto sesudah tidak jelas",
    });
    const [lok] = await db.select().from(lokasi).where(eq(lokasi.id, idLokasi));
    expect(lok.status).toBe("TERCEMAR");
    const [notif] = await getNotifikasi(pelapor);
    expect(notif).toMatchObject({ idLaporan, status: "TIDAK_VALID", alasanPenolakan: "Foto sesudah tidak jelas" });
  });

  it.each([
    ["tanpa body", undefined],
    ["alasan kosong", { alasan: "" }],
    ["alasan spasi", { alasan: "   " }],
    ["alasan null", { alasan: null }],
  ])("CleanIt %s → 400 DATA_TIDAK_LENGKAP pada fields.alasan", async (_judul, body) => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: idLokasi });

    const res = await tolak(idLaporan, body);

    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.code).toBe("DATA_TIDAK_LENGKAP");
    expect(error.fields).toHaveProperty("alasan");
    expect((await getLaporan(idLaporan)).status).toBe("BELUM_DIPERIKSA");
  });

  it.each([
    ["alasan > 500 karakter", { alasan: "x".repeat(501) }],
    ["alasan bukan string", { alasan: 123 }],
  ])("menolak %s dengan 400 FORMAT_TIDAK_VALID", async (_judul, body) => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    const res = await tolak(idLaporan, body);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("FORMAT_TIDAK_VALID");
    expect((await getLaporan(idLaporan)).status).toBe("BELUM_DIPERIKSA");
  });

  it("menerima alasan tepat 500 karakter", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: idLokasi });
    expect((await tolak(idLaporan, { alasan: "x".repeat(500) })).status).toBe(200);
  });

  it("menolak laporan yang sudah diverifikasi (409), tidak ada (404), atau ID tidak valid (400)", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    expect((await tolak(idLaporan)).status).toBe(200);

    const ulang = await tolak(idLaporan, { alasan: "Lagi" });
    expect(ulang.status).toBe(409);
    expect((await ulang.json()).error.code).toBe("SUDAH_DIVERIFIKASI");
    expect((await getLaporan(idLaporan)).alasanPenolakan).toBeNull();

    expect((await tolak(4242)).status).toBe(404);
    expect((await tolak("0")).status).toBe(400);
  });

  it("menolak tamu (401) dan Masyarakat (403)", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    expect((await tolak(idLaporan, {}, null)).status).toBe(401);
    const res = await tolak(idLaporan, {}, { id: pelapor, role: "MASYARAKAT" });
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });
});

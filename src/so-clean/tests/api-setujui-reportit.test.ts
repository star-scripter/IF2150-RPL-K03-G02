import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/laporan/[id]/setujui/route";
import { petakan_lokasi, ubah_status } from "@/server/controllers/manager-laporan";
import { db } from "@/server/db";
import { laporan, lokasi, pengguna } from "@/server/db/schema";
import type { Role } from "@/types/api";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatPengguna,
  kosongkanDatabase,
  tungguAdaYangMenungguKunci,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const LAT = -6.885;
const LNG = 107.6065;

let operator: string;

async function setujui(
  id: number | string,
  body?: unknown,
  sebagai: { id: string; role: Role } | null = { id: operator, role: "OPERATOR" },
) {
  const cookie = sebagai ? await cookieSesi(sebagai.id, sebagai.role) : undefined;
  const request = buatRequest(`/api/laporan/${id}/setujui`, { method: "POST", cookie, body });
  return POST(request, { params: Promise.resolve({ id: String(id) }) });
}

async function semuaLokasi() {
  return db.select().from(lokasi).orderBy(lokasi.id);
}

describe.runIf(DATABASE_TEST_AKTIF)("POST /api/laporan/:id/setujui — ReportIt (BE-13)", () => {
  let pelapor: string;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    await kosongkanDatabase();
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    pelapor = (await buatPengguna({ saldoPoin: 40 })).id;
  });

  it("membuat lokasi baru dengan poin default 50 dan nama = teks lokasi laporan", async () => {
    const { idLaporan } = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: pelapor,
      lokasiTeks: "Teras Cikapundung dekat jembatan",
      latitude: LAT,
      longitude: LNG,
      jenisSampah: "RUMAH_TANGGA",
    });

    const res = await setujui(idLaporan, {});
    expect(res.status).toBe(200);
    const { data } = await res.json();

    const [baru] = await semuaLokasi();
    expect(data).toEqual({ idLaporan, status: "VALID", idLokasi: baru.id, digabung: false });
    expect(baru).toMatchObject({
      nama: "Teras Cikapundung dekat jembatan",
      alamat: "Teras Cikapundung dekat jembatan",
      latitude: LAT,
      longitude: LNG,
      jenisSampah: "RUMAH_TANGGA",
      status: "TERCEMAR",
      poin: 50,
      laporanAsalId: idLaporan,
    });

    const [row] = await db.select().from(laporan).where(eq(laporan.id, idLaporan));
    expect(row).toMatchObject({ status: "VALID", lokasiId: baru.id, diverifikasiOleh: operator });
    expect(row.diverifikasiAt).toBeInstanceOf(Date);

    // N1: pelapor ReportIt tidak mendapat poin.
    const [akun] = await db.select().from(pengguna).where(eq(pengguna.id, pelapor));
    expect(akun.saldoPoin).toBe(40);
  });

  it("memakai poin dan nama lokasi dari Operator; nama kosong kembali ke default", async () => {
    const a = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, latitude: LAT, longitude: LNG });
    const b = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: pelapor,
      lokasiTeks: "Pantai Ancol barat",
      latitude: -6.12,
      longitude: 106.83,
    });

    expect((await setujui(a.idLaporan, { poin: 200, namaLokasi: "  Bantaran Teras  " })).status).toBe(200);
    expect((await setujui(b.idLaporan, { poin: 100, namaLokasi: "   " })).status).toBe(200);

    const [la, lb] = await semuaLokasi();
    expect(la).toMatchObject({ nama: "Bantaran Teras", poin: 200 });
    expect(lb).toMatchObject({ nama: "Pantai Ancol barat", poin: 100 });
  });

  it("boleh tanpa body sama sekali", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    const res = await setujui(idLaporan);
    expect(res.status).toBe(200);
    expect((await semuaLokasi())[0].poin).toBe(50);
  });

  it("menggabungkan ke lokasi TERCEMAR dalam radius 50 m; poin dan nama Operator diabaikan", async () => {
    const lama = await buatLokasi({ pelapor, operator, nama: "Bantaran Teras", poin: 100 });
    const { idLaporan } = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: pelapor,
      latitude: LAT + 0.00027, // ±30 m
      longitude: LNG,
    });

    const res = await setujui(idLaporan, { poin: 200, namaLokasi: "Nama baru" });
    expect(await res.json()).toEqual({
      data: { idLaporan, status: "VALID", idLokasi: lama.idLokasi, digabung: true },
    });

    const daftar = await semuaLokasi();
    expect(daftar).toHaveLength(1);
    expect(daftar[0]).toMatchObject({ nama: "Bantaran Teras", poin: 100, laporanAsalId: lama.idLaporanAsal });
    const [row] = await db.select().from(laporan).where(eq(laporan.id, idLaporan));
    expect(row.lokasiId).toBe(lama.idLokasi);
  });

  it("tidak menggabungkan ke lokasi > 50 m atau lokasi yang sudah DIBERSIHKAN", async () => {
    await buatLokasi({ pelapor, operator, nama: "Bersih", status: "DIBERSIHKAN" });
    await buatLokasi({ pelapor, operator, nama: "Jauh", latitude: LAT + 0.000459 }); // ±51 m
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, latitude: LAT, longitude: LNG });

    const { data } = await (await setujui(idLaporan, {})).json();
    expect(data.digabung).toBe(false);
    expect(await semuaLokasi()).toHaveLength(3);
  });

  it.each([
    ["poin 75", { poin: 75 }, "poin"],
    ["poin string", { poin: "50" }, "poin"],
    ["nama > 255", { namaLokasi: "x".repeat(256) }, "namaLokasi"],
  ])("menolak %s dengan 400 FORMAT_TIDAK_VALID tanpa mengubah data", async (_judul, body, field) => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });

    const res = await setujui(idLaporan, body);
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.code).toBe("FORMAT_TIDAK_VALID");
    expect(error.fields).toHaveProperty(field);

    const [row] = await db.select().from(laporan).where(eq(laporan.id, idLaporan));
    expect(row.status).toBe("BELUM_DIPERIKSA");
    expect(await semuaLokasi()).toHaveLength(0);
  });

  it("menolak body yang bukan JSON dengan 400", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    const request = new Request(`http://localhost/api/laporan/${idLaporan}/setujui`, {
      method: "POST",
      headers: { cookie: await cookieSesi(operator, "OPERATOR"), "content-type": "application/json" },
      body: "{bukan json",
    });
    const res = await POST(request, { params: Promise.resolve({ id: String(idLaporan) }) });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("FORMAT_TIDAK_VALID");
  });

  it("menolak laporan yang sudah diverifikasi (409) dan yang tidak ada (404)", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    expect((await setujui(idLaporan, {})).status).toBe(200);

    const ulang = await setujui(idLaporan, {});
    expect(ulang.status).toBe(409);
    expect((await ulang.json()).error.code).toBe("SUDAH_DIVERIFIKASI");
    expect(await semuaLokasi()).toHaveLength(1);

    const tidakAda = await setujui(4242, {});
    expect(tidakAda.status).toBe(404);
    expect((await setujui("abc", {})).status).toBe(400);
  });

  it("menolak tamu (401) dan Masyarakat (403)", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    expect((await setujui(idLaporan, {}, null)).status).toBe(401);
    expect((await setujui(idLaporan, {}, { id: pelapor, role: "MASYARAKAT" })).status).toBe(403);
  });

  it("dua ReportIt berdekatan yang disetujui bersamaan hanya membuat satu lokasi", async () => {
    const a = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, latitude: LAT, longitude: LNG });
    const b = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor, latitude: LAT + 0.0002, longitude: LNG });
    let lepas!: () => void;
    const gerbang = new Promise<void>((r) => (lepas = r));
    let aSudahDipetakan!: () => void;
    const sudahDipetakan = new Promise<void>((r) => (aSudahDipetakan = r));

    // A memetakan lokasi lalu menahan transaksinya (beserta advisory lock) sampai gerbang dibuka.
    const transaksiA = db.transaction(async (tx) => {
      const laporanA = await ubah_status(a.idLaporan, { status: "VALID", diverifikasiOleh: operator }, tx);
      const hasil = await petakan_lokasi(laporanA, { poin: 50 }, tx);
      aSudahDipetakan();
      await gerbang;
      return hasil;
    });
    await sudahDipetakan;

    // B harus menunggu kunci pemetaan; setelah A commit, B melihat lokasi A dan menggabung.
    const transaksiB = db.transaction(async (tx) => {
      const laporanB = await ubah_status(b.idLaporan, { status: "VALID", diverifikasiOleh: operator }, tx);
      return petakan_lokasi(laporanB, { poin: 50 }, tx);
    });
    await tungguAdaYangMenungguKunci();
    lepas();

    const hasilA = await transaksiA;
    const hasilB = await transaksiB;
    expect(hasilA.digabung).toBe(false);
    expect(hasilB).toEqual({ idLokasi: hasilA.idLokasi, digabung: true });
    expect(await semuaLokasi()).toHaveLength(1);
  });
});

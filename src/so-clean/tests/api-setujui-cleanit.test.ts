import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postLaporan } from "@/app/api/laporan/route";
import { POST as postSetujui } from "@/app/api/laporan/[id]/setujui/route";
import { setujui_cleanit } from "@/server/controllers/validator-laporan";
import { db } from "@/server/db";
import { laporan, lokasi, pengguna } from "@/server/db/schema";
import * as LaporanModel from "@/server/models/laporan";
import * as LokasiModel from "@/server/models/lokasi";
import { getNotifikasi } from "@/server/models/pengguna";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatMedia,
  buatPengguna,
  kosongkanDatabase,
  tungguAdaYangMenungguKunci,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

let operator: string;

async function setujui(id: number, body: unknown = {}) {
  const cookie = await cookieSesi(operator, "OPERATOR");
  const request = buatRequest(`/api/laporan/${id}/setujui`, { method: "POST", cookie, body });
  return postSetujui(request, { params: Promise.resolve({ id: String(id) }) });
}

async function getLaporan(id: number) {
  const [row] = await db.select().from(laporan).where(eq(laporan.id, id));
  return row;
}

async function saldo(id: string) {
  const [row] = await db.select({ saldo: pengguna.saldoPoin }).from(pengguna).where(eq(pengguna.id, id));
  return row.saldo;
}

async function statusLokasi(id: number) {
  const [row] = await db.select({ status: lokasi.status }).from(lokasi).where(eq(lokasi.id, id));
  return row.status;
}

/** Gerbang untuk menahan transaksi sampai transaksi lain benar-benar menunggu kunci. */
function buatGerbang() {
  let lepas!: () => void;
  const gerbang = new Promise<void>((r) => (lepas = r));
  let tandai!: () => void;
  const siap = new Promise<void>((r) => (tandai = r));
  return { gerbang, lepas, siap, tandai };
}

describe.runIf(DATABASE_TEST_AKTIF)("POST /api/laporan/:id/setujui — CleanIt (BE-14)", () => {
  let pelaporAsal: string;
  let relawan: string;
  let idLokasi: number;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    await kosongkanDatabase();
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    pelaporAsal = (await buatPengguna()).id;
    relawan = (await buatPengguna({ saldoPoin: 40 })).id;
    idLokasi = (await buatLokasi({ pelapor: pelaporAsal, operator, poin: 100 })).idLokasi;
  });

  it("lokasi DIBERSIHKAN, pelapor mendapat lokasi.poin, dan notifikasi memuat poinnya", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });

    // Body poin/namaLokasi khusus ReportIt; untuk CleanIt diabaikan.
    const res = await setujui(idLaporan, { poin: 200 });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { idLaporan, status: "VALID", poinDiberikan: 100 } });
    expect(await statusLokasi(idLokasi)).toBe("DIBERSIHKAN");
    expect(await saldo(relawan)).toBe(140);
    expect(await getLaporan(idLaporan)).toMatchObject({ status: "VALID", diverifikasiOleh: operator });

    const notifikasi = await getNotifikasi(relawan);
    expect(notifikasi[0]).toMatchObject({ idLaporan, status: "VALID", poinDiberikan: 100, dibaca: false });
  });

  it("menolak otomatis CleanIt lain yang menunggu untuk lokasi yang sama (K12)", async () => {
    const sari = (await buatPengguna()).id;
    const a = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });
    const b = await buatLaporan({ jenis: "CLEANIT", idPengguna: sari, lokasiId: idLokasi });
    const lokasiLain = await buatLokasi({ pelapor: pelaporAsal, operator, latitude: -6.12, longitude: 106.83 });
    const c = await buatLaporan({ jenis: "CLEANIT", idPengguna: sari, lokasiId: lokasiLain.idLokasi });

    expect((await setujui(a.idLaporan)).status).toBe(200);

    expect(await getLaporan(b.idLaporan)).toMatchObject({
      status: "TIDAK_VALID",
      alasanPenolakan: "Lokasi sudah dibersihkan",
      diverifikasiOleh: operator,
    });
    expect((await getLaporan(c.idLaporan)).status).toBe("BELUM_DIPERIKSA");

    const ulang = await setujui(b.idLaporan);
    expect(ulang.status).toBe(409);
    expect((await ulang.json()).error.code).toBe("SUDAH_DIVERIFIKASI");
    expect(await saldo(sari)).toBe(0);
  });

  it("lokasi yang sudah DIBERSIHKAN → 409 LOKASI_SUDAH_DIBERSIHKAN tanpa mengubah data", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });
    await db.update(lokasi).set({ status: "DIBERSIHKAN" }).where(eq(lokasi.id, idLokasi));

    const res = await setujui(idLaporan);

    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("LOKASI_SUDAH_DIBERSIHKAN");
    expect((await getLaporan(idLaporan)).status).toBe("BELUM_DIPERIKSA");
    expect(await saldo(relawan)).toBe(40);
  });

  it("pelapor asal boleh membersihkan lokasinya sendiri dan tetap mendapat poin", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelaporAsal, lokasiId: idLokasi });
    expect((await setujui(idLaporan)).status).toBe(200);
    expect(await saldo(pelaporAsal)).toBe(100);
  });

  it("dua persetujuan bersamaan untuk satu lokasi: yang kedua menunggu kunci lokasi lalu 409 LOKASI_SUDAH_DIBERSIHKAN", async () => {
    const a = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });
    const sari = (await buatPengguna()).id;
    const b = await buatLaporan({ jenis: "CLEANIT", idPengguna: sari, lokasiId: idLokasi });
    const g = buatGerbang();

    const pertama = db.transaction(async (tx) => {
      const hasil = await setujui_cleanit((await LaporanModel.getLaporanById(a.idLaporan, tx))!, operator, tx);
      g.tandai();
      await g.gerbang;
      return hasil;
    });
    await g.siap;

    const kedua = setujui(b.idLaporan);
    await tungguAdaYangMenungguKunci();
    g.lepas();

    await expect(pertama).resolves.toMatchObject({ poinDiberikan: 100 });
    const res = await kedua;
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("LOKASI_SUDAH_DIBERSIHKAN");
    expect(await getLaporan(b.idLaporan)).toMatchObject({ status: "TIDAK_VALID", alasanPenolakan: "Lokasi sudah dibersihkan" });
    expect([await saldo(relawan), await saldo(sari)]).toEqual([140, 0]);
  });

  it("CleanIt yang tersimpan saat persetujuan menunggu kunci ikut tertolak otomatis", async () => {
    const disetujui = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });
    const sari = (await buatPengguna()).id;
    const g = buatGerbang();
    let idBaru = 0;

    // Meniru BE-11: baca lokasi FOR SHARE, insert CleanIt, lalu tahan commit.
    const pembuatan = db.transaction(async (tx) => {
      await LokasiModel.getUntukValidasiCleanIt(idLokasi, tx);
      const baru = await LaporanModel.buatLaporan(
        { jenis: "CLEANIT", idPengguna: sari, judul: "Pembersihan", waktu: new Date(), lokasiId: idLokasi },
        tx,
      );
      idBaru = baru.idLaporan;
      g.tandai();
      await g.gerbang;
    });
    await g.siap;

    const persetujuan = setujui(disetujui.idLaporan);
    await tungguAdaYangMenungguKunci();
    g.lepas();

    await pembuatan;
    expect((await persetujuan).status).toBe(200);
    expect(await getLaporan(idBaru)).toMatchObject({
      status: "TIDAK_VALID",
      alasanPenolakan: "Lokasi sudah dibersihkan",
    });
  });

  it("CleanIt yang dikirim saat persetujuan berjalan menunggu, lalu ditolak 409 LOKASI_SUDAH_DIBERSIHKAN", async () => {
    const disetujui = await buatLaporan({ jenis: "CLEANIT", idPengguna: relawan, lokasiId: idLokasi });
    const sari = (await buatPengguna()).id;
    const foto = await buatMedia({ idPengguna: sari, laporanId: null });
    const g = buatGerbang();

    const persetujuan = db.transaction(async (tx) => {
      await setujui_cleanit((await LaporanModel.getLaporanById(disetujui.idLaporan, tx))!, operator, tx);
      g.tandai();
      await g.gerbang;
    });
    await g.siap;

    const kirim = postLaporan(
      buatRequest("/api/laporan", {
        method: "POST",
        cookie: await cookieSesi(sari, "MASYARAKAT"),
        body: {
          jenis: "CLEANIT",
          judul: "Pembersihan bantaran",
          waktu: new Date(Date.now() - 60_000).toISOString(),
          idMedia: [foto.idMedia],
          lokasiId: idLokasi,
        },
      }),
    );
    await tungguAdaYangMenungguKunci();
    g.lepas();

    await persetujuan;
    const res = await kirim;
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("LOKASI_SUDAH_DIBERSIHKAN");
    const cleanItSari = await db.select().from(laporan).where(eq(laporan.idPengguna, sari));
    expect(cleanItSari).toHaveLength(0);
  });
});

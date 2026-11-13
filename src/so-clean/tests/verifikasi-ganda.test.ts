import { beforeEach, describe, expect, it } from "vitest";
import { ubah_status } from "@/server/controllers/manager-laporan";
import { db } from "@/server/db";
import { getLaporanById, ubah_status_verifikasi } from "@/server/models/laporan";
import {
  DATABASE_TEST_AKTIF,
  buatLaporan,
  buatLokasi,
  buatPengguna,
  kosongkanDatabase,
  tungguAdaYangMenungguKunci,
} from "./helpers/db";

describe.runIf(DATABASE_TEST_AKTIF)("cegah verifikasi ganda (BE-16)", () => {
  let pelapor: string;
  let operator: string;
  let operator2: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    pelapor = (await buatPengguna()).id;
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    operator2 = (await buatPengguna({ role: "OPERATOR" })).id;
  });

  it("mengisi status, alasan, diverifikasi_oleh, dan diverifikasi_at dalam satu UPDATE", async () => {
    const { idLokasi } = await buatLokasi({ pelapor, operator });
    const { idLaporan } = await buatLaporan({ jenis: "CLEANIT", idPengguna: pelapor, lokasiId: idLokasi });

    // CleanIt TIDAK_VALID tanpa alasan melanggar CHECK; harus berhasil karena satu UPDATE.
    const hasil = await ubah_status_verifikasi(idLaporan, {
      status: "TIDAK_VALID",
      diverifikasiOleh: operator,
      alasanPenolakan: "Foto buram",
    });

    expect(hasil).toMatchObject({
      idLaporan,
      status: "TIDAK_VALID",
      alasanPenolakan: "Foto buram",
      diverifikasiOleh: operator,
    });
    expect(hasil!.diverifikasiAt).toBeInstanceOf(Date);
  });

  it("tidak mengubah laporan yang sudah diverifikasi dan mengembalikan null", async () => {
    const { idLaporan } = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: pelapor,
      status: "TIDAK_VALID",
      alasanPenolakan: "Ganda",
      diverifikasiOleh: operator,
    });
    const sebelum = await getLaporanById(idLaporan);

    await expect(
      ubah_status_verifikasi(idLaporan, { status: "VALID", diverifikasiOleh: operator2 }),
    ).resolves.toBeNull();
    await expect(getLaporanById(idLaporan)).resolves.toEqual(sebelum);
  });

  it("ManagerLaporan.ubah_status memetakan hasil ke SUDAH_DIVERIFIKASI dan NOT_FOUND", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    const keputusan = { status: "VALID", diverifikasiOleh: operator } as const;

    await expect(db.transaction((tx) => ubah_status(idLaporan, keputusan, tx))).resolves.toMatchObject({
      status: "VALID",
    });
    await expect(db.transaction((tx) => ubah_status(idLaporan, keputusan, tx))).rejects.toMatchObject({
      code: "SUDAH_DIVERIFIKASI",
      status: 409,
    });
    await expect(db.transaction((tx) => ubah_status(999999, keputusan, tx))).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("dua Operator bersamaan: yang menunggu kunci mendapat SUDAH_DIVERIFIKASI setelah yang pertama commit", async () => {
    const { idLaporan } = await buatLaporan({ jenis: "REPORTIT", idPengguna: pelapor });
    let lepas!: () => void;
    const gerbang = new Promise<void>((r) => (lepas = r));
    let pertamaSudahUpdate!: () => void;
    const sudahUpdate = new Promise<void>((r) => (pertamaSudahUpdate = r));

    // Transaksi pertama memverifikasi lalu menahan kunci barisnya sampai gerbang dibuka.
    const pertama = db.transaction(async (tx) => {
      await ubah_status(idLaporan, { status: "VALID", diverifikasiOleh: operator }, tx);
      pertamaSudahUpdate();
      await gerbang;
    });
    await sudahUpdate;

    // Transaksi kedua harus menunggu kunci, lalu mengevaluasi ulang status setelah commit.
    const kedua = db.transaction((tx) =>
      ubah_status(idLaporan, { status: "TIDAK_VALID", diverifikasiOleh: operator2 }, tx),
    );
    await tungguAdaYangMenungguKunci();
    lepas();

    await expect(pertama).resolves.toBeUndefined();
    await expect(kedua).rejects.toMatchObject({ code: "SUDAH_DIVERIFIKASI" });
    await expect(getLaporanById(idLaporan)).resolves.toMatchObject({
      status: "VALID",
      diverifikasiOleh: operator,
    });
  });
});

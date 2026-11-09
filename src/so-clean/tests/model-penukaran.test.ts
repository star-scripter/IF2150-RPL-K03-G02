import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { penukaran } from "@/server/db/schema";
import {
  KARAKTER_VOUCHER,
  MAKS_PERCOBAAN_VOUCHER,
  buatKodeVoucher,
  buatPenukaran,
} from "@/server/models/penukaran";
import { DATABASE_TEST_AKTIF, buatPengguna, buatReward, kosongkanDatabase } from "./helpers/db";

const POLA_VOUCHER = /^SC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

describe("buatKodeVoucher (K5)", () => {
  it("berformat SC-XXXX-XXXX tanpa 0, O, 1, I", () => {
    expect(KARAKTER_VOUCHER).not.toMatch(/[0O1I]/);
    expect(new Set(KARAKTER_VOUCHER).size).toBe(KARAKTER_VOUCHER.length);
    for (let i = 0; i < 200; i++) expect(buatKodeVoucher()).toMatch(POLA_VOUCHER);
  });
});

describe.runIf(DATABASE_TEST_AKTIF)("model Penukaran (C13)", () => {
  let idPengguna: string;
  let reward: { idReward: number; nama: string; hargaPoin: number };

  beforeEach(async () => {
    await kosongkanDatabase();
    idPengguna = (await buatPengguna()).id;
    const { idReward } = await buatReward({ nama: "Voucher kopi", hargaPoin: 50 });
    reward = { idReward, nama: "Voucher kopi", hargaPoin: 50 };
  });

  it("buatPenukaran menyimpan catatan dengan poin_dipakai = harga reward", async () => {
    const hasil = await buatPenukaran(idPengguna, reward);

    expect(hasil).toMatchObject({ namaReward: "Voucher kopi", poinDipakai: 50 });
    expect(hasil.kodeVoucher).toMatch(POLA_VOUCHER);
    expect(hasil.idPenukaran).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(hasil.waktuPenukaran).toISOString()).toBe(hasil.waktuPenukaran);

    const rows = await db.select().from(penukaran);
    expect(rows).toEqual([
      expect.objectContaining({
        id: hasil.idPenukaran,
        idPengguna,
        idReward: reward.idReward,
        poinDipakai: 50,
        kodeVoucher: hasil.kodeVoucher,
      }),
    ]);
  });

  it("membuat kode baru jika kode voucher bentrok", async () => {
    await buatPenukaran(idPengguna, reward, db, () => "SC-AAAA-AAAA");
    const kode = ["SC-AAAA-AAAA", "SC-BBBB-BBBB"];

    const hasil = await buatPenukaran(idPengguna, reward, db, () => kode.shift() as string);

    expect(hasil.kodeVoucher).toBe("SC-BBBB-BBBB");
    expect(await db.select().from(penukaran)).toHaveLength(2);
  });

  it("melempar error jika kode terus bentrok", async () => {
    await buatPenukaran(idPengguna, reward, db, () => "SC-AAAA-AAAA");
    let dipanggil = 0;
    const selaluSama = () => {
      dipanggil++;
      return "SC-AAAA-AAAA";
    };

    await expect(buatPenukaran(idPengguna, reward, db, selaluSama)).rejects.toThrow(
      "kode voucher unik",
    );
    expect(dipanggil).toBe(MAKS_PERCOBAAN_VOUCHER);
  });
});

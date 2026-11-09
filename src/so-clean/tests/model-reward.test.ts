import { beforeEach, describe, expect, it } from "vitest";
import { cariReward, getRewardTersedia, tersedia } from "@/server/models/reward";
import { DATABASE_TEST_AKTIF, buatReward, kosongkanDatabase } from "./helpers/db";

describe("tersedia (C09 Algo-004)", () => {
  it("true hanya jika stok > 0", () => {
    expect(tersedia({ stok: 1 })).toBe(true);
    expect(tersedia({ stok: 0 })).toBe(false);
  });
});

describe.runIf(DATABASE_TEST_AKTIF)("model Reward (C09)", () => {
  beforeEach(async () => {
    await kosongkanDatabase();
  });

  it("getRewardTersedia mengembalikan list kosong jika belum ada reward", async () => {
    await expect(getRewardTersedia()).resolves.toEqual([]);
  });

  it("getRewardTersedia mengembalikan semua reward: stok > 0 dulu, lalu harga naik (N3)", async () => {
    const habisMurah = await buatReward({ nama: "Habis murah", hargaPoin: 50, stok: 0 });
    const mahal = await buatReward({ nama: "Mahal", hargaPoin: 200, stok: 3 });
    const murah = await buatReward({ nama: "Murah", hargaPoin: 50, stok: 1 });
    const sedang = await buatReward({ nama: "Sedang", hargaPoin: 100, stok: 5 });

    const hasil = await getRewardTersedia();

    expect(hasil.map((r) => r.idReward)).toEqual([
      murah.idReward,
      sedang.idReward,
      mahal.idReward,
      habisMurah.idReward,
    ]);
    expect(hasil[3]).toEqual({
      idReward: habisMurah.idReward,
      nama: "Habis murah",
      jenis: "VOUCHER",
      hargaPoin: 50,
      stok: 0,
    });
  });

  it("cariReward mengembalikan reward, atau null jika tidak ada", async () => {
    const { idReward } = await buatReward({ nama: "Tumbler", jenis: "MERCHANDISE", hargaPoin: 100 });
    await expect(cariReward(idReward)).resolves.toEqual({
      idReward,
      nama: "Tumbler",
      jenis: "MERCHANDISE",
      hargaPoin: 100,
      stok: 10,
    });
    await expect(cariReward(idReward + 1)).resolves.toBeNull();
  });
});

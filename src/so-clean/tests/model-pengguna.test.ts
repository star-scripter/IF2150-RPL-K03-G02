import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { pengguna } from "@/server/db/schema";
import {
  buatMasyarakat,
  cariUntukLogin,
  cukupPoin,
  getMe,
  getSaldoPoin,
  kurangiPoin,
  tambah_poin,
} from "@/server/models/pengguna";
import { DATABASE_TEST_AKTIF, buatPengguna, kosongkanDatabase } from "./helpers/db";

const ID_TIDAK_ADA = "00000000-0000-4000-8000-000000000000";

describe.runIf(DATABASE_TEST_AKTIF)("model Pengguna — auth (C08, BE-A)", () => {
  beforeEach(async () => {
    await kosongkanDatabase();
  });

  it("cariUntukLogin mencocokkan email ternormalisasi dan null jika tidak ada", async () => {
    const dibuat = await buatMasyarakat({
      nama: "  Budi Santoso ",
      email: " Budi@Example.test ",
      passwordHash: "hash-budi",
    });

    expect(dibuat).toMatchObject({
      nama: "Budi Santoso",
      email: "budi@example.test",
      role: "MASYARAKAT",
    });

    const hasil = await cariUntukLogin(" BUDI@example.test ");
    expect(hasil).toMatchObject({ id: dibuat?.id, email: "budi@example.test", passwordHash: "hash-budi" });
    await expect(cariUntukLogin("tidak-ada@example.test")).resolves.toBeNull();
  });

  it("buatMasyarakat selalu role MASYARAKAT dan null untuk email duplikat", async () => {
    const pertama = await buatMasyarakat({
      nama: "Budi Santoso",
      email: "budi@example.test",
      passwordHash: "hash-budi",
    });
    expect(pertama?.role).toBe("MASYARAKAT");

    const duplikat = await buatMasyarakat({
      nama: "Budi Lain",
      email: " BUDI@example.test ",
      passwordHash: "hash-lain",
    });
    expect(duplikat).toBeNull();

    const semua = await db.select().from(pengguna);
    expect(semua).toHaveLength(1);
    expect(semua[0]).toMatchObject({ nama: "Budi Santoso", email: "budi@example.test" });
  });

  it("getMe mengembalikan profil terbaru dan null jika pengguna tidak ada", async () => {
    const dibuat = await buatMasyarakat({
      nama: "Budi Santoso",
      email: "budi@example.test",
      passwordHash: "hash-budi",
    });
    if (!dibuat) throw new Error("Pengguna uji gagal dibuat.");
    await db.update(pengguna).set({ saldoPoin: 75 }).where(eq(pengguna.id, dibuat.id));

    await expect(getMe(dibuat.id)).resolves.toMatchObject({
      id: dibuat.id,
      nama: "Budi Santoso",
      email: "budi@example.test",
      role: "MASYARAKAT",
      saldoPoin: 75,
    });
    await expect(getMe(ID_TIDAK_ADA)).resolves.toBeNull();
  });
});

describe.runIf(DATABASE_TEST_AKTIF)("model Pengguna — saldo poin (C08)", () => {
  let id: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    id = (await buatPengguna({ saldoPoin: 100 })).id;
  });

  it("getSaldoPoin membaca saldo dari database, null jika pengguna tidak ada", async () => {
    await expect(getSaldoPoin(id)).resolves.toBe(100);
    await expect(getSaldoPoin(ID_TIDAK_ADA)).resolves.toBeNull();
  });

  it("cukupPoin true hanya jika saldo >= harga", async () => {
    await expect(cukupPoin(id, 50)).resolves.toBe(true);
    await expect(cukupPoin(id, 100)).resolves.toBe(true);
    await expect(cukupPoin(id, 101)).resolves.toBe(false);
    await expect(cukupPoin(ID_TIDAK_ADA, 1)).resolves.toBe(false);
  });

  it("kurangiPoin mengembalikan saldo baru dan bisa sampai 0", async () => {
    await expect(kurangiPoin(id, 40)).resolves.toBe(60);
    await expect(kurangiPoin(id, 60)).resolves.toBe(0);
    await expect(getSaldoPoin(id)).resolves.toBe(0);
  });

  it("kurangiPoin mengembalikan null dan tidak mengubah saldo jika tidak cukup", async () => {
    await expect(kurangiPoin(id, 101)).resolves.toBeNull();
    await expect(getSaldoPoin(id)).resolves.toBe(100);
  });

  it("kurangiPoin menolak jumlah yang bukan bilangan bulat positif", async () => {
    await expect(kurangiPoin(id, 0)).rejects.toThrow(RangeError);
    await expect(kurangiPoin(id, -5)).rejects.toThrow(RangeError);
    await expect(kurangiPoin(id, 1.5)).rejects.toThrow(RangeError);
    await expect(getSaldoPoin(id)).resolves.toBe(100);
  });

  it("dua kurangiPoin bersamaan tidak membuat saldo negatif", async () => {
    const hasil = await Promise.all([kurangiPoin(id, 70), kurangiPoin(id, 70)]);
    expect(hasil.filter((saldo) => saldo === 30)).toHaveLength(1);
    expect(hasil.filter((saldo) => saldo === null)).toHaveLength(1);
    await expect(getSaldoPoin(id)).resolves.toBe(30);
  });

  it("tambah_poin menambah saldo dan mengembalikan saldo baru", async () => {
    await expect(tambah_poin(id, 200)).resolves.toBe(300);
    await expect(getSaldoPoin(id)).resolves.toBe(300);
    await expect(tambah_poin(ID_TIDAK_ADA, 50)).resolves.toBeNull();
  });

  it("tambah_poin dengan jumlah <= 0 tidak mengubah saldo (Algo-004)", async () => {
    await expect(tambah_poin(id, 0)).resolves.toBe(100);
    await expect(tambah_poin(id, -20)).resolves.toBe(100);
  });

  it("perubahan di dalam transaksi ikut dibatalkan saat rollback", async () => {
    await expect(
      db.transaction(async (tx) => {
        await kurangiPoin(id, 50, tx);
        await expect(getSaldoPoin(id, tx)).resolves.toBe(50);
        throw new Error("batal");
      }),
    ).rejects.toThrow("batal");
    await expect(getSaldoPoin(id)).resolves.toBe(100);
  });
});

import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { cekPoin, kurangiPoin, tambah_poin } from "@/server/controllers/manager-poin";
import { db } from "@/server/db";
import { pengguna } from "@/server/db/schema";
import { DATABASE_TEST_AKTIF, buatPengguna, kosongkanDatabase } from "./helpers/db";

const ID_TIDAK_ADA = "00000000-0000-4000-8000-000000000000";

async function saldo(id: string) {
  const [row] = await db.select({ saldo: pengguna.saldoPoin }).from(pengguna).where(eq(pengguna.id, id));
  return row.saldo;
}

describe.runIf(DATABASE_TEST_AKTIF)("ManagerPoin (C11) — operasi yang dipakai C05 dan C16", () => {
  let id: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    id = (await buatPengguna({ saldoPoin: 100 })).id;
  });

  it("cekPoin: true jika saldo cukup (termasuk tepat sama), false jika kurang, harga negatif, atau pengguna tidak ada", async () => {
    await expect(cekPoin(id, 50)).resolves.toBe(true);
    await expect(cekPoin(id, 100)).resolves.toBe(true);
    await expect(cekPoin(id, 101)).resolves.toBe(false);
    await expect(cekPoin(id, -1)).resolves.toBe(false);
    await expect(cekPoin(ID_TIDAK_ADA, 1)).resolves.toBe(false);
  });

  it("kurangiPoin di dalam transaksi: saldo baru jika cukup, null tanpa perubahan jika kurang atau jumlah ≤ 0", async () => {
    await expect(db.transaction((tx) => kurangiPoin(id, 30, tx))).resolves.toBe(70);
    await expect(db.transaction((tx) => kurangiPoin(id, 71, tx))).resolves.toBeNull();
    await expect(db.transaction((tx) => kurangiPoin(id, 0, tx))).resolves.toBeNull();
    await expect(db.transaction((tx) => kurangiPoin(id, -10, tx))).resolves.toBeNull();
    expect(await saldo(id)).toBe(70);
  });

  it("tambah_poin di dalam transaksi: menambah saldo, mengabaikan jumlah ≤ 0, null untuk pengguna tidak ada", async () => {
    await expect(db.transaction((tx) => tambah_poin(id, 200, tx))).resolves.toBe(300);
    await expect(db.transaction((tx) => tambah_poin(id, 0, tx))).resolves.toBeNull();
    await expect(db.transaction((tx) => tambah_poin(id, -50, tx))).resolves.toBeNull();
    await expect(db.transaction((tx) => tambah_poin(ID_TIDAK_ADA, 50, tx))).resolves.toBeNull();
    expect(await saldo(id)).toBe(300);
  });
});

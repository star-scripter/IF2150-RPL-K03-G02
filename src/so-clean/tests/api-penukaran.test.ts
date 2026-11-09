import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/penukaran/route";
import { db } from "@/server/db";
import { pengguna, penukaran, reward } from "@/server/db/schema";
import * as PenukaranModel from "@/server/models/penukaran";
import type { Role } from "@/types/api";
import { DATABASE_TEST_AKTIF, buatPengguna, buatReward, kosongkanDatabase } from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

async function tukar(idPengguna: string | null, body: unknown, role: Role = "MASYARAKAT") {
  const cookie = idPengguna ? await cookieSesi(idPengguna, role) : undefined;
  return POST(buatRequest("/api/penukaran", { method: "POST", cookie, body }));
}

async function saldo(id: string) {
  const [row] = await db.select({ saldo: pengguna.saldoPoin }).from(pengguna).where(eq(pengguna.id, id));
  return row.saldo;
}

async function stok(idReward: number) {
  const [row] = await db.select({ stok: reward.stok }).from(reward).where(eq(reward.id, idReward));
  return row.stok;
}

describe.runIf(DATABASE_TEST_AKTIF)("POST /api/penukaran", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    await kosongkanDatabase();
  });

  it("menukar poin: saldo dan stok berkurang, penukaran tercatat dengan voucher", async () => {
    const { id } = await buatPengguna({ saldoPoin: 120 });
    const { idReward } = await buatReward({ nama: "Voucher kopi", hargaPoin: 50, stok: 3 });

    const res = await tukar(id, { idReward });

    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(Object.keys(data).sort()).toEqual(
      ["idPenukaran", "kodeVoucher", "namaReward", "poinDipakai", "sisaPoin", "waktuPenukaran"].sort(),
    );
    expect(data).toMatchObject({ namaReward: "Voucher kopi", poinDipakai: 50, sisaPoin: 70 });
    expect(data.kodeVoucher).toMatch(/^SC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);

    expect(await saldo(id)).toBe(70);
    expect(await stok(idReward)).toBe(2);
    const rows = await db.select().from(penukaran);
    expect(rows).toEqual([
      expect.objectContaining({ id: data.idPenukaran, idPengguna: id, idReward, poinDipakai: 50 }),
    ]);
  });

  it("boleh menukar sampai saldo tepat 0", async () => {
    const { id } = await buatPengguna({ saldoPoin: 100 });
    const { idReward } = await buatReward({ hargaPoin: 100 });
    const res = await tukar(id, { idReward });
    expect(res.status).toBe(201);
    expect((await res.json()).data.sisaPoin).toBe(0);
  });

  it.each([
    ["tanpa idReward", {}],
    ["idReward string", { idReward: "1" }],
    ["idReward pecahan", { idReward: 1.5 }],
    ["idReward nol", { idReward: 0 }],
  ])("menolak body %s dengan 400 FORMAT_TIDAK_VALID", async (_judul, body) => {
    const { id } = await buatPengguna({ saldoPoin: 100 });
    const res = await tukar(id, body);
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.code).toBe("FORMAT_TIDAK_VALID");
    expect(error.fields).toHaveProperty("idReward");
  });

  it("menolak reward yang tidak ada dengan 404 NOT_FOUND", async () => {
    const { id } = await buatPengguna({ saldoPoin: 100 });
    const res = await tukar(id, { idReward: 999 });
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("NOT_FOUND");
  });

  it("menolak reward stok 0 dengan 422 STOK_HABIS tanpa mengubah saldo", async () => {
    const { id } = await buatPengguna({ saldoPoin: 500 });
    const { idReward } = await buatReward({ stok: 0 });
    const res = await tukar(id, { idReward });
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("STOK_HABIS");
    expect(await saldo(id)).toBe(500);
  });

  it("menolak saldo kurang dengan 422 POIN_TIDAK_CUKUP tanpa mengubah stok", async () => {
    const { id } = await buatPengguna({ saldoPoin: 49 });
    const { idReward } = await buatReward({ hargaPoin: 50, stok: 3 });
    const res = await tukar(id, { idReward });
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("POIN_TIDAK_CUKUP");
    expect(await stok(idReward)).toBe(3);
    expect(await db.select().from(penukaran)).toHaveLength(0);
  });

  it("menolak tamu (401) dan Operator (403)", async () => {
    const { idReward } = await buatReward();
    const resTamu = await tukar(null, { idReward });
    expect(resTamu.status).toBe(401);

    const operator = await buatPengguna({ role: "OPERATOR", saldoPoin: 0 });
    const resOperator = await tukar(operator.id, { idReward }, "OPERATOR");
    expect(resOperator.status).toBe(403);
    expect((await resOperator.json()).error.code).toBe("FORBIDDEN");
  });

  it("me-rollback saldo dan stok jika pencatatan penukaran gagal (500)", async () => {
    const { id } = await buatPengguna({ saldoPoin: 100 });
    const { idReward } = await buatReward({ hargaPoin: 50, stok: 1 });
    vi.spyOn(PenukaranModel, "buatPenukaran").mockRejectedValueOnce(new Error("insert gagal"));

    const res = await tukar(id, { idReward });

    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("INTERNAL_ERROR");
    expect(await saldo(id)).toBe(100);
    expect(await stok(idReward)).toBe(1);
    expect(await db.select().from(penukaran)).toHaveLength(0);
  });

  it("dua penukaran bersamaan dengan saldo untuk satu: satu berhasil, saldo tidak negatif", async () => {
    const { id } = await buatPengguna({ saldoPoin: 100 });
    const { idReward } = await buatReward({ hargaPoin: 100, stok: 5 });

    const hasil = await Promise.all([tukar(id, { idReward }), tukar(id, { idReward })]);

    expect(hasil.map((r) => r.status).sort()).toEqual([201, 422]);
    const gagal = await hasil.find((r) => r.status === 422)!.json();
    expect(gagal.error.code).toBe("POIN_TIDAK_CUKUP");
    expect(await saldo(id)).toBe(0);
    expect(await stok(idReward)).toBe(4);
    expect(await db.select().from(penukaran)).toHaveLength(1);
  });

  it("dua pengguna berebut stok terakhir: satu berhasil, yang kalah saldonya utuh", async () => {
    const budi = await buatPengguna({ saldoPoin: 100 });
    const sari = await buatPengguna({ saldoPoin: 100 });
    const { idReward } = await buatReward({ hargaPoin: 50, stok: 1 });

    const hasil = await Promise.all([tukar(budi.id, { idReward }), tukar(sari.id, { idReward })]);

    expect(hasil.map((r) => r.status).sort()).toEqual([201, 422]);
    const gagal = await hasil.find((r) => r.status === 422)!.json();
    expect(gagal.error.code).toBe("STOK_HABIS");
    expect(await stok(idReward)).toBe(0);
    expect([await saldo(budi.id), await saldo(sari.id)].sort()).toEqual([100, 50]);
    expect(await db.select().from(penukaran)).toHaveLength(1);
  });
});

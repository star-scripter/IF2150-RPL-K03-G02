import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/reward/route";
import { DATABASE_TEST_AKTIF, buatPengguna, buatReward, kosongkanDatabase } from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/reward", () => {
  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
  });

  it("mengembalikan semua reward dengan urutan N3 untuk Masyarakat", async () => {
    const habis = await buatReward({ nama: "Tote bag", hargaPoin: 50, stok: 0 });
    const kopi = await buatReward({ nama: "Voucher kopi", hargaPoin: 50, stok: 20 });
    const { id } = await buatPengguna();

    const res = await GET(buatRequest("/api/reward", { cookie: await cookieSesi(id, "MASYARAKAT") }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: [
        { idReward: kopi.idReward, nama: "Voucher kopi", jenis: "VOUCHER", hargaPoin: 50, stok: 20 },
        { idReward: habis.idReward, nama: "Tote bag", jenis: "VOUCHER", hargaPoin: 50, stok: 0 },
      ],
    });
  });

  it("boleh diakses Operator dan mengembalikan list kosong jika belum ada reward", async () => {
    const { id } = await buatPengguna({ role: "OPERATOR" });
    const res = await GET(buatRequest("/api/reward", { cookie: await cookieSesi(id, "OPERATOR") }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [] });
  });

  it("menolak tamu dengan 401 UNAUTHORIZED", async () => {
    const res = await GET(buatRequest("/api/reward"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });
});

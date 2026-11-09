import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/penukaran/route";
import { db } from "@/server/db";
import { penukaran } from "@/server/db/schema";
import type { Role } from "@/types/api";
import { DATABASE_TEST_AKTIF, buatPengguna, buatReward, kosongkanDatabase } from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

async function riwayat(idPengguna: string | null, query = "", role: Role = "MASYARAKAT") {
  const cookie = idPengguna ? await cookieSesi(idPengguna, role) : undefined;
  return GET(buatRequest(`/api/penukaran${query}`, { cookie }));
}

/** Penukaran ke-n dibuat n jam setelah 9 Nov 2026 00.00 UTC. */
async function isiPenukaran(idPengguna: string, idReward: number, jumlah: number, awalan = "A") {
  for (let n = 1; n <= jumlah; n++) {
    await db.insert(penukaran).values({
      idPengguna,
      idReward,
      poinDipakai: 50,
      kodeVoucher: `SC-${awalan}${String(n).padStart(3, "2")}-TEST`,
      waktu: new Date(Date.UTC(2026, 10, 9, n)),
    });
  }
}

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/penukaran (riwayat)", () => {
  let budi: string;
  let idReward: number;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
    budi = (await buatPengguna()).id;
    idReward = (await buatReward({ nama: "Voucher kopi" })).idReward;
  });

  it("mengembalikan list kosong dengan meta default page 1, limit 10", async () => {
    const res = await riwayat(budi);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [], meta: { page: 1, limit: 10, total: 0 } });
  });

  it("hanya berisi penukaran milik pengguna, urut terbaru, dengan bentuk Penukaran", async () => {
    const sari = (await buatPengguna()).id;
    await isiPenukaran(budi, idReward, 2, "B");
    await isiPenukaran(sari, idReward, 3, "S");

    const res = await riwayat(budi);
    const body = await res.json();

    expect(body.meta).toEqual({ page: 1, limit: 10, total: 2 });
    expect(body.data).toEqual([
      {
        idPenukaran: expect.any(String),
        namaReward: "Voucher kopi",
        kodeVoucher: "SC-B222-TEST",
        poinDipakai: 50,
        waktuPenukaran: "2026-11-09T02:00:00.000Z",
      },
      expect.objectContaining({ kodeVoucher: "SC-B221-TEST", waktuPenukaran: "2026-11-09T01:00:00.000Z" }),
    ]);
  });

  it("membagi halaman sesuai page dan limit, meta.total tetap jumlah semua", async () => {
    await isiPenukaran(budi, idReward, 5);

    const hal2 = await (await riwayat(budi, "?page=2&limit=2")).json();
    expect(hal2.meta).toEqual({ page: 2, limit: 2, total: 5 });
    expect(hal2.data.map((p: { kodeVoucher: string }) => p.kodeVoucher)).toEqual([
      "SC-A223-TEST",
      "SC-A222-TEST",
    ]);

    const lewat = await (await riwayat(budi, "?page=4&limit=2")).json();
    expect(lewat).toEqual({ data: [], meta: { page: 4, limit: 2, total: 5 } });
  });

  it.each(["?page=0", "?page=abc", "?limit=0", "?limit=51", "?limit=2.5"])(
    "menolak query %s dengan 400 FORMAT_TIDAK_VALID",
    async (query) => {
      const res = await riwayat(budi, query);
      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe("FORMAT_TIDAK_VALID");
    },
  );

  it("menolak tamu (401) dan Operator (403)", async () => {
    expect((await riwayat(null)).status).toBe(401);
    const operator = (await buatPengguna({ role: "OPERATOR" })).id;
    const res = await riwayat(operator, "", "OPERATOR");
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });
});

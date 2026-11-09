import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/poin/saldo/route";
import { DATABASE_TEST_AKTIF, buatPengguna, kosongkanDatabase } from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/poin/saldo", () => {
  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await kosongkanDatabase();
  });

  it("mengembalikan saldo Masyarakat dari database", async () => {
    const { id } = await buatPengguna({ saldoPoin: 150 });
    const res = await GET(buatRequest("/api/poin/saldo", { cookie: await cookieSesi(id, "MASYARAKAT") }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { saldoPoin: 150 } });
  });

  it("menolak tamu dengan 401 UNAUTHORIZED", async () => {
    const res = await GET(buatRequest("/api/poin/saldo"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });

  it("menolak Operator dengan 403 FORBIDDEN", async () => {
    const { id } = await buatPengguna({ role: "OPERATOR" });
    const res = await GET(buatRequest("/api/poin/saldo", { cookie: await cookieSesi(id, "OPERATOR") }));
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });

  it("menolak sesi untuk akun yang sudah tidak ada dengan 401", async () => {
    const cookie = await cookieSesi("00000000-0000-4000-8000-000000000000", "MASYARAKAT");
    const res = await GET(buatRequest("/api/poin/saldo", { cookie }));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });
});

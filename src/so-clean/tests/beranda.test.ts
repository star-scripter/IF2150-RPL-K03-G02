/** Logika Beranda (FE-08) dan data yang ditampilkannya dari mock `/api/me`. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { authApi } from "../lib/api/endpoints";
import { MENU_LAPORAN, formatPoin } from "../lib/beranda";
import { ROUTE } from "../lib/nav";
import { PASSWORD_UJI, resetDb } from "../mocks/db";
import { server } from "../mocks/node";

describe("formatPoin", () => {
  it("memakai pemisah ribuan Indonesia", () => {
    expect(formatPoin(67)).toBe("67");
    expect(formatPoin(1250)).toBe("1.250");
    expect(formatPoin(0)).toBe("0");
  });
});

describe("MENU_LAPORAN", () => {
  it("ReportIt membuka form ReportIt", () => {
    expect(MENU_LAPORAN.find((m) => m.id === "reportit")?.href).toBe(ROUTE.reportit);
  });

  it("CleanIt selalu membuka daftar lokasi I-09, bukan form CleanIt (N2)", () => {
    expect(MENU_LAPORAN.find((m) => m.id === "cleanit")?.href).toBe(ROUTE.lokasi);
  });

  it("setiap kartu punya ikon dari public/icons", () => {
    for (const menu of MENU_LAPORAN) expect(menu.ikon.src).toMatch(/^\/icons\/.+\.svg$/);
  });
});

describe("data Beranda dari /api/me (mock)", () => {
  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  beforeEach(() => resetDb());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("menampilkan nama dan saldo pengguna yang login", async () => {
    await authApi.login({ email: "masyarakat@soclean.test", password: PASSWORD_UJI });
    const me = await authApi.me();
    expect(me.nama).toBe("Dapin Tampan");
    expect(formatPoin(me.saldoPoin)).toBe("67");
  });
});

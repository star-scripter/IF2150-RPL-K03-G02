/** Logika form Login (FE-06) dan alurnya terhadap mock API kontrak. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../lib/api/client";
import { authApi } from "../lib/api/endpoints";
import { PESAN_ERROR } from "../lib/api/pesan-error";
import { galatDariError, normalisasiEmail, tujuanSetelahLogin, validasiLogin } from "../lib/login";
import { ROUTE } from "../lib/nav";
import { PASSWORD_UJI, resetDb } from "../mocks/db";
import { server } from "../mocks/node";

describe("validasiLogin", () => {
  it("lolos untuk email dan password terisi", () => {
    expect(validasiLogin({ email: "warga@soclean.test", password: "rahasia123" })).toBeNull();
  });

  it("menolak isian kosong", () => {
    expect(validasiLogin({ email: "   ", password: "" })).toEqual({
      fields: { email: "Email wajib diisi.", password: "Password wajib diisi." },
    });
  });

  it("menolak email tanpa format yang benar", () => {
    expect(validasiLogin({ email: "warga@", password: "x" })?.fields.email).toBe(
      "Format email tidak valid.",
    );
  });

  it("tidak memotong spasi di password", () => {
    expect(validasiLogin({ email: "a@b.co", password: " " })).toBeNull();
  });
});

describe("normalisasiEmail", () => {
  it("trim dan huruf kecil seperti server (N7)", () => {
    expect(normalisasiEmail("  Warga@SoClean.TEST ")).toBe("warga@soclean.test");
  });
});

describe("tujuanSetelahLogin", () => {
  it("Masyarakat ke Beranda (I-03), Operator ke validasi laporan (I-07)", () => {
    expect(tujuanSetelahLogin("MASYARAKAT")).toBe(ROUTE.beranda);
    expect(tujuanSetelahLogin("OPERATOR")).toBe(ROUTE.operatorLaporan);
  });
});

describe("galatDariError", () => {
  it("LOGIN_GAGAL menjadi satu pesan generik", () => {
    expect(galatDariError(new ApiError("LOGIN_GAGAL", 401))).toEqual({
      umum: PESAN_ERROR.LOGIN_GAGAL,
      fields: {},
    });
  });

  it("FORMAT_TIDAK_VALID memetakan fields email/password", () => {
    const error = new ApiError("FORMAT_TIDAK_VALID", 400, {
      fields: { email: "Email tidak valid." },
    });
    expect(galatDariError(error)).toEqual({ fields: { email: "Email tidak valid." } });
  });

  it("FORMAT_TIDAK_VALID tanpa field form menjadi pesan umum", () => {
    const error = new ApiError("FORMAT_TIDAK_VALID", 400, { fields: { _request: "x" } });
    expect(galatDariError(error).umum).toBe(PESAN_ERROR.FORMAT_TIDAK_VALID);
  });

  it("error jaringan dan error tak dikenal punya pesan umum", () => {
    expect(galatDariError(new ApiError("JARINGAN", 0)).umum).toBe(PESAN_ERROR.JARINGAN);
    expect(galatDariError(new Error("boom")).umum).toBe(PESAN_ERROR.INTERNAL_ERROR);
  });
});

describe("alur login terhadap mock API", () => {
  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  beforeEach(() => resetDb());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("berhasil dengan email yang dinormalisasi", async () => {
    const pengguna = await authApi.login({
      email: normalisasiEmail(" MASYARAKAT@soclean.test "),
      password: PASSWORD_UJI,
    });
    expect(pengguna.role).toBe("MASYARAKAT");
  });

  it("password salah menghasilkan pesan LOGIN_GAGAL", async () => {
    let galat;
    try {
      await authApi.login({ email: "masyarakat@soclean.test", password: "salah12345" });
    } catch (error) {
      galat = galatDariError(error);
    }
    expect(galat).toEqual({ umum: PESAN_ERROR.LOGIN_GAGAL, fields: {} });
  });
});

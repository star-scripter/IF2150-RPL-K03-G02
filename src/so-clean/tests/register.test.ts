/** Logika form Register (FE-07) dan alurnya terhadap mock API kontrak. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../lib/api/client";
import { authApi } from "../lib/api/endpoints";
import { PESAN_ERROR } from "../lib/api/pesan-error";
import { bodyRegister, galatDariError, validasiRegister } from "../lib/register";
import { resetDb } from "../mocks/db";
import { server } from "../mocks/node";

const VALID = { nama: "Warga Baru", email: "warga@soclean.test", password: "rahasia123" };

describe("validasiRegister (Aturan akun N7)", () => {
  it("lolos untuk isian yang valid", () => {
    expect(validasiRegister(VALID)).toBeNull();
  });

  it("menolak isian kosong", () => {
    expect(validasiRegister({ nama: "  ", email: "", password: "" })?.fields).toEqual({
      nama: "Nama wajib diisi.",
      email: "Email wajib diisi.",
      password: "Password minimal 8 karakter.",
    });
  });

  it("nama 1–100 karakter setelah trim", () => {
    expect(validasiRegister({ ...VALID, nama: ` ${"a".repeat(100)} ` })).toBeNull();
    expect(validasiRegister({ ...VALID, nama: "a".repeat(101) })?.fields.nama).toBe(
      "Nama maksimal 100 karakter.",
    );
  });

  it("email harus berformat benar dan maksimal 255 karakter", () => {
    expect(validasiRegister({ ...VALID, email: "warga@soclean" })?.fields.email).toBe(
      "Format email tidak valid.",
    );
    // 250 + "@b.co" = 255 karakter (batas, masih valid); satu karakter lagi ditolak.
    expect(validasiRegister({ ...VALID, email: `${"a".repeat(250)}@b.co` })).toBeNull();
    expect(validasiRegister({ ...VALID, email: `${"a".repeat(251)}@b.co` })?.fields.email).toBe(
      "Email maksimal 255 karakter.",
    );
  });

  it("password 8–72 karakter", () => {
    expect(validasiRegister({ ...VALID, password: "1234567" })?.fields.password).toBe(
      "Password minimal 8 karakter.",
    );
    expect(validasiRegister({ ...VALID, password: "a".repeat(72) })).toBeNull();
    expect(validasiRegister({ ...VALID, password: "a".repeat(73) })?.fields.password).toBe(
      "Password maksimal 72 karakter.",
    );
  });

  it("password tidak boleh sama dengan email yang sudah dinormalisasi", () => {
    const isian = { ...VALID, email: " Warga@SoClean.test ", password: "warga@soclean.test" };
    expect(validasiRegister(isian)?.fields.password).toBe("Password tidak boleh sama dengan email.");
  });
});

describe("bodyRegister", () => {
  it("menormalisasi nama dan email, tidak mengubah password", () => {
    expect(bodyRegister({ nama: "  Warga  ", email: " WARGA@SoClean.TEST ", password: " rahasia1 " })).toEqual({
      nama: "Warga",
      email: "warga@soclean.test",
      password: " rahasia1 ",
    });
  });
});

describe("galatDariError", () => {
  it("EMAIL_TERDAFTAR ditampilkan di field email", () => {
    expect(galatDariError(new ApiError("EMAIL_TERDAFTAR", 409))).toEqual({
      fields: { email: PESAN_ERROR.EMAIL_TERDAFTAR },
    });
  });

  it("FORMAT_TIDAK_VALID memetakan fields dari server", () => {
    const error = new ApiError("FORMAT_TIDAK_VALID", 400, {
      fields: { nama: "Nama wajib diisi.", password: "Password minimal 8 karakter." },
    });
    expect(galatDariError(error).fields).toEqual({
      nama: "Nama wajib diisi.",
      password: "Password minimal 8 karakter.",
    });
  });

  it("error jaringan dan error tak dikenal menjadi pesan umum", () => {
    expect(galatDariError(new ApiError("JARINGAN", 0)).umum).toBe(PESAN_ERROR.JARINGAN);
    expect(galatDariError(new Error("boom")).umum).toBe(PESAN_ERROR.INTERNAL_ERROR);
  });
});

describe("alur register lalu login terhadap mock API", () => {
  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  beforeEach(() => resetDb());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("register, login, lalu /api/me mengembalikan pengguna baru", async () => {
    const body = bodyRegister({ ...VALID, email: " Warga@SoClean.test " });
    await expect(authApi.register(body)).resolves.toMatchObject({ role: "MASYARAKAT" });
    await authApi.login({ email: body.email, password: body.password });
    await expect(authApi.me()).resolves.toMatchObject({ email: "warga@soclean.test", saldoPoin: 0 });
  });

  it("email yang sudah terdaftar ditampilkan di field email", async () => {
    let galat;
    try {
      await authApi.register(bodyRegister({ ...VALID, email: "masyarakat@soclean.test" }));
    } catch (error) {
      galat = galatDariError(error);
    }
    expect(galat).toEqual({ fields: { email: PESAN_ERROR.EMAIL_TERDAFTAR } });
  });
});

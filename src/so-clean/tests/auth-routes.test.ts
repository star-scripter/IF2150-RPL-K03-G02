import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PenggunaMe, Role } from "../types/api";
import { hashPassword } from "../server/auth/password";
import { ApiError } from "../server/api/errors";

const mocks = vi.hoisted(() => ({
  cariUntukLogin: vi.fn(),
  buatMasyarakat: vi.fn(),
  getMe: vi.fn(),
  setSessionCookie: vi.fn(),
  deleteSessionCookie: vi.fn(),
  requireSessionCookie: vi.fn(),
}));

vi.mock("@/server/models/pengguna", () => ({
  cariUntukLogin: mocks.cariUntukLogin,
  buatMasyarakat: mocks.buatMasyarakat,
  getMe: mocks.getMe,
}));

vi.mock("@/server/auth/session-cookie", () => ({
  setSessionCookie: mocks.setSessionCookie,
  deleteSessionCookie: mocks.deleteSessionCookie,
  requireSessionCookie: mocks.requireSessionCookie,
}));

import { POST as registerRoute } from "../app/api/auth/register/route";
import { POST as loginRoute } from "../app/api/auth/login/route";
import { POST as logoutRoute } from "../app/api/auth/logout/route";
import { GET as meRoute } from "../app/api/me/route";

const operatorSession = { idPengguna: "operator-id", role: "OPERATOR" as const };
const masyarakat = {
  id: "masyarakat-id",
  nama: "Budi Santoso",
  email: "budi@example.test",
  role: "MASYARAKAT" as const,
};

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.setSessionCookie.mockResolvedValue(undefined);
  mocks.deleteSessionCookie.mockResolvedValue(undefined);
});

describe("auth Route Handlers and controller integration", () => {
  it("registers a normalized Masyarakat account and does not return its password hash", async () => {
    mocks.buatMasyarakat.mockImplementation(async (input: { nama: string; email: string }) => ({
      id: "new-user-id",
      nama: input.nama,
      email: input.email,
      role: "MASYARAKAT" satisfies Role,
    }));

    const response = await registerRoute(
      jsonRequest("http://localhost/api/auth/register", {
        nama: "  Budi Santoso  ",
        email: " Budi@Example.Test ",
        password: "Password#123",
        role: "OPERATOR",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        id: "new-user-id",
        nama: "Budi Santoso",
        email: "budi@example.test",
        role: "MASYARAKAT",
      },
    });
    expect(mocks.buatMasyarakat).toHaveBeenCalledWith(
      expect.objectContaining({ nama: "Budi Santoso", email: "budi@example.test" }),
    );
    expect(mocks.buatMasyarakat.mock.calls[0]?.[0].passwordHash).not.toBe("Password#123");
    expect(mocks.setSessionCookie).not.toHaveBeenCalled();
  });

  it("maps a duplicate registration email to EMAIL_TERDAFTAR", async () => {
    mocks.buatMasyarakat.mockResolvedValue(null);

    const response = await registerRoute(
      jsonRequest("http://localhost/api/auth/register", {
        nama: "Budi",
        email: "budi@example.test",
        password: "Password#123",
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "EMAIL_TERDAFTAR", fields: { email: expect.any(String) } },
    });
  });

  it("logs in with normalized email, sets a session and omits passwordHash", async () => {
    const passwordHash = await hashPassword("Password#123");
    mocks.cariUntukLogin.mockResolvedValue({ ...masyarakat, passwordHash });

    const response = await loginRoute(
      jsonRequest("http://localhost/api/auth/login", {
        email: "  BUDI@EXAMPLE.TEST ",
        password: "Password#123",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: masyarakat });
    expect(mocks.cariUntukLogin).toHaveBeenCalledWith("budi@example.test");
    expect(mocks.setSessionCookie).toHaveBeenCalledWith({
      idPengguna: masyarakat.id,
      role: masyarakat.role,
    });
  });

  it("uses the same generic LOGIN_GAGAL response for unknown email and wrong password", async () => {
    const request = (email: string, password: string) =>
      jsonRequest("http://localhost/api/auth/login", { email, password });

    mocks.cariUntukLogin.mockResolvedValueOnce(null);
    const unknownEmail = await loginRoute(request("unknown@example.test", "Password#123"));

    const passwordHash = await hashPassword("Correct#123");
    mocks.cariUntukLogin.mockResolvedValueOnce({ ...masyarakat, passwordHash });
    const wrongPassword = await loginRoute(request("budi@example.test", "WrongPassword#1"));

    const unknownBody = await unknownEmail.json();
    const wrongBody = await wrongPassword.json();
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownBody).toEqual(wrongBody);
    expect(unknownBody).toEqual({ error: { code: "LOGIN_GAGAL", message: "Email atau password salah." } });
    expect(mocks.setSessionCookie).not.toHaveBeenCalled();
  });

  it("requires a session for GET /api/me and returns the latest database profile", async () => {
    mocks.requireSessionCookie.mockResolvedValue(operatorSession);
    const profile: PenggunaMe = {
      id: operatorSession.idPengguna,
      nama: "Operator terbaru",
      email: "operator@example.test",
      role: operatorSession.role,
      saldoPoin: 0,
    };
    mocks.getMe.mockResolvedValue(profile);

    const response = await meRoute(new Request("http://localhost/api/me"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: profile });
    expect(mocks.getMe).toHaveBeenCalledWith(operatorSession.idPengguna);
  });

  it("returns UNAUTHORIZED for /api/me without a valid session", async () => {
    mocks.requireSessionCookie.mockRejectedValue(
      new ApiError("UNAUTHORIZED", "Sesi tidak valid atau telah berakhir."),
    );

    const response = await meRoute(new Request("http://localhost/api/me"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
    });
    expect(mocks.getMe).not.toHaveBeenCalled();
  });

  it("requires a session for logout and deletes the session cookie", async () => {
    mocks.requireSessionCookie.mockResolvedValue(operatorSession);

    const response = await logoutRoute(
      new Request("http://localhost/api/auth/logout", { method: "POST" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { ok: true } });
    expect(mocks.deleteSessionCookie).toHaveBeenCalledOnce();
  });
});

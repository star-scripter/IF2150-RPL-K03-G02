import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, cookies } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));

import {
  deleteSessionCookie,
  getSessionCookie,
  requireRoleCookie,
  setSessionCookie,
} from "../server/auth/session-cookie";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "../server/auth/session-token";

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-session-secret-with-enough-entropy");
  cookies.mockResolvedValue(cookieStore);
  cookieStore.get.mockReset().mockReturnValue(undefined);
  cookieStore.set.mockReset();
  cookieStore.delete.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("session cookie adapter", () => {
  it("sets a signed httpOnly seven-day cookie with the session claims", async () => {
    const session = { idPengguna: "user-id", role: "MASYARAKAT" as const };
    await setSessionCookie(session);

    expect(cookieStore.set).toHaveBeenCalledOnce();
    const [name, token, options] = cookieStore.set.mock.calls[0] as [
      string,
      string,
      { httpOnly: boolean; secure: boolean; sameSite: string; path: string; maxAge: number },
    ];
    expect(name).toBe(SESSION_COOKIE_NAME);
    expect(options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    await expect(verifySessionToken(token)).resolves.toEqual(session);
  });

  it("reads and verifies the session cookie", async () => {
    const session = { idPengguna: "user-id", role: "OPERATOR" as const };
    await setSessionCookie(session);
    const [, token] = cookieStore.set.mock.calls[0] as [string, string, unknown];
    cookieStore.get.mockReturnValue({ name: SESSION_COOKIE_NAME, value: token });

    await expect(getSessionCookie()).resolves.toEqual(session);
  });

  it("deletes the named session cookie on logout", async () => {
    await deleteSessionCookie();
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
  });

  it("returns UNAUTHORIZED when a protected route has no session", async () => {
    await expect(requireRoleCookie("OPERATOR")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  it("returns FORBIDDEN when the signed session has the wrong role", async () => {
    const token = await signSessionToken({ idPengguna: "user-id", role: "MASYARAKAT" });
    cookieStore.get.mockReturnValue({ name: SESSION_COOKIE_NAME, value: token });

    await expect(requireRoleCookie("OPERATOR")).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("returns the verified session when the role is allowed", async () => {
    const session = { idPengguna: "operator-id", role: "OPERATOR" as const };
    const token = await signSessionToken(session);
    cookieStore.get.mockReturnValue({ name: SESSION_COOKIE_NAME, value: token });

    await expect(requireRoleCookie("OPERATOR")).resolves.toEqual(session);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, signSessionToken } from "../server/auth/session-token";
import { proxy } from "../proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Next.js Proxy page-session redirects", () => {
  it("redirects a guest from a protected page to /login", async () => {
    const response = await proxy(new NextRequest("https://soclean.test/lokasi"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://soclean.test/login");
  });

  it("allows the public login and register pages without a session", async () => {
    const login = await proxy(new NextRequest("https://soclean.test/login"));
    const register = await proxy(new NextRequest("https://soclean.test/register"));

    expect(login.status).toBe(200);
    expect(register.status).toBe(200);
  });

  it("does not apply page redirects to API routes or static assets", async () => {
    const api = await proxy(new NextRequest("https://soclean.test/api/me"));
    const asset = await proxy(new NextRequest("https://soclean.test/icons/logo.svg"));

    expect(api.status).toBe(200);
    expect(asset.status).toBe(200);
  });

  it("allows a protected page with a valid signed session", async () => {
    vi.stubEnv("SESSION_SECRET", "proxy-test-secret-with-enough-entropy");
    const request = new NextRequest("https://soclean.test/lokasi");
    request.cookies.set(
      SESSION_COOKIE_NAME,
      await signSessionToken({ idPengguna: "masyarakat-id", role: "MASYARAKAT" }),
    );

    const response = await proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects when the cookie is invalid or expired", async () => {
    vi.stubEnv("SESSION_SECRET", "proxy-test-secret-with-enough-entropy");
    const request = new NextRequest("https://soclean.test/lokasi");
    request.cookies.set(SESSION_COOKIE_NAME, "not-a-valid-jwt");

    const response = await proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://soclean.test/login");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loginSchema,
  normalisasiEmail,
  normalisasiNama,
  registerSchema,
} from "../server/auth/account";
import { hashPassword, PASSWORD_HASH_COST, verifyPassword } from "../server/auth/password";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from "../server/auth/session-token";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("auth account rules", () => {
  it("normalizes email and name", () => {
    expect(normalisasiEmail("  Budi@Example.test  ")).toBe("budi@example.test");
    expect(normalisasiNama("  Budi Santoso  ")).toBe("Budi Santoso");

    expect(
      registerSchema.parse({
        nama: "  Budi Santoso ",
        email: " Budi@Example.test ",
        password: "password123",
      }),
    ).toEqual({ nama: "Budi Santoso", email: "budi@example.test", password: "password123" });
  });

  it("requires a trimmed 1–100 character name and an 8–72 character password", () => {
    expect(() => registerSchema.parse({ nama: "  ", email: "budi@example.test", password: "password123" })).toThrow();
    expect(() => registerSchema.parse({ nama: "Budi", email: "budi@example.test", password: "short7" })).toThrow();
    expect(() => registerSchema.parse({ nama: "Budi", email: "budi@example.test", password: "p".repeat(73) })).toThrow();
  });

  it("rejects a password identical to the normalized email", () => {
    const parsed = registerSchema.safeParse({
      nama: "Budi",
      email: " BUDI@example.test ",
      password: "budi@example.test",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0]?.path).toEqual(["password"]);
  });

  it("normalizes login email but leaves the password unchanged", () => {
    expect(loginSchema.parse({ email: " Budi@Example.test ", password: " case-Sensitive " })).toEqual({
      email: "budi@example.test",
      password: " case-Sensitive ",
    });
  });
});

describe("bcrypt password helper", () => {
  it("hashes at the contract cost and verifies the raw password", async () => {
    const password = "soclean123";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(PASSWORD_HASH_COST).toBe(12);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });
});

describe("JWT session helper", () => {
  const session = { idPengguna: "user-uuid", role: "MASYARAKAT" as const };
  const issuedAt = new Date("2026-11-09T00:00:00.000Z");

  it("signs and verifies HS256 claims with the seven-day lifetime", async () => {
    vi.stubEnv("SESSION_SECRET", "a-test-only-session-secret-with-enough-entropy");
    const token = await signSessionToken(session, issuedAt);

    await expect(verifySessionToken(token, issuedAt)).resolves.toEqual(session);
    await expect(
      verifySessionToken(token, new Date(issuedAt.getTime() + SESSION_TTL_SECONDS * 1000 + 1000)),
    ).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    vi.stubEnv("SESSION_SECRET", "first-test-secret-with-enough-entropy");
    const token = await signSessionToken(session, issuedAt);
    vi.stubEnv("SESSION_SECRET", "second-test-secret-with-enough-entropy");

    await expect(verifySessionToken(token, issuedAt)).resolves.toBeNull();
  });

  it("rejects invalid role claims", async () => {
    vi.stubEnv("SESSION_SECRET", "a-test-only-session-secret-with-enough-entropy");
    const { SignJWT } = await import("jose");
    const token = await new SignJWT({ idPengguna: "user-uuid", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(issuedAt.getTime() / 1000))
      .setExpirationTime(Math.floor(issuedAt.getTime() / 1000) + SESSION_TTL_SECONDS)
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));

    await expect(verifySessionToken(token, issuedAt)).resolves.toBeNull();
  });

  it("defines an httpOnly seven-day cookie and enables Secure only in production", () => {
    expect(SESSION_COOKIE_NAME).toBe("soclean_session");
    expect(sessionCookieOptions(false)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    expect(sessionCookieOptions(true).secure).toBe(true);
  });
});

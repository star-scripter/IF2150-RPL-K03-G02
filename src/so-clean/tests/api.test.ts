import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "../server/api/errors";
import { handleApiRequest } from "../server/api/handler";
import { apiFailure, apiList, apiSuccess } from "../server/api/responses";
import { parseFormData, parseJsonBody, parseQuery } from "../server/api/validation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("API response helpers", () => {
  it("returns the contract success envelope", async () => {
    const response = apiSuccess({ idReward: 3 });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { idReward: 3 } });
  });

  it("returns the contract list envelope with pagination metadata", async () => {
    const response = apiList([{ idLaporan: 1 }], { page: 1, limit: 6, total: 1 });

    await expect(response.json()).resolves.toEqual({
      data: [{ idLaporan: 1 }],
      meta: { page: 1, limit: 6, total: 1 },
    });
  });

  it("uses the status associated with the error code", async () => {
    const response = apiFailure(
      new ApiError("FORMAT_TIDAK_VALID", "ID tidak valid.", { id: "Harus positif." }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORMAT_TIDAK_VALID",
        message: "ID tidak valid.",
        fields: { id: "Harus positif." },
      },
    });
  });

  it("never exposes details or fields for INTERNAL_ERROR", async () => {
    const response = apiFailure(
      new ApiError("INTERNAL_ERROR", "database password=secret", { detail: "secret" }),
    );

    await expect(response.json()).resolves.toEqual({
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." },
    });
  });
});

describe("Zod request validation helpers", () => {
  it("parses a valid JSON body", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: "Budi" }),
    });

    await expect(parseJsonBody(request, z.object({ nama: z.string() }))).resolves.toEqual({
      nama: "Budi",
    });
  });

  it("returns field errors for an invalid JSON body", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: 42 }),
    });

    await expect(parseJsonBody(request, z.object({ nama: z.string() }))).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
      fields: { nama: expect.any(String) },
    });
  });

  it("allows the caller to map missing required fields to DATA_TIDAK_LENGKAP", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    await expect(
      parseJsonBody(request, z.object({ judul: z.string() }), "DATA_TIDAK_LENGKAP"),
    ).rejects.toMatchObject({
      code: "DATA_TIDAK_LENGKAP",
      fields: { judul: expect.any(String) },
    });
  });

  it("maps malformed JSON to FORMAT_TIDAK_VALID", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid",
    });

    await expect(parseJsonBody(request, z.object({}))).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
      fields: { body: expect.any(String) },
    });
  });

  it("parses and validates query parameters", () => {
    const request = new Request("http://localhost/api/laporan?page=2&limit=6");
    const schema = z.object({ page: z.coerce.number().int(), limit: z.coerce.number().int() });

    expect(parseQuery(request, schema)).toEqual({ page: 2, limit: 6 });
  });

  it("parses and validates multipart form fields", async () => {
    const form = new FormData();
    form.set("judul", "Pembersihan Pantai");
    const request = new Request("http://localhost/api/test", { method: "POST", body: form });

    await expect(parseFormData(request, z.object({ judul: z.string() }))).resolves.toEqual({
      judul: "Pembersihan Pantai",
    });
  });
});

describe("API route error boundary", () => {
  it("returns a known ApiError using its contract status and envelope", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request("http://localhost/api/reward/9");
    const response = await handleApiRequest(request, () => {
      throw new ApiError("NOT_FOUND", "Reward tidak ditemukan.");
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "NOT_FOUND", message: "Reward tidak ditemukan." },
    });
  });

  it("normalizes a ZodError thrown by a controller", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request("http://localhost/api/test", { method: "POST" });
    const response = await handleApiRequest(request, () => {
      z.object({ nama: z.string() }).parse({ nama: 3 });
      return apiSuccess({ ok: true });
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "FORMAT_TIDAK_VALID",
        fields: { nama: expect.any(String) },
      },
    });
  });

  it("hides unexpected error details from the response and logs safe context", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new Request("http://localhost/api/auth/login?token=do-not-log-this");
    const response = await handleApiRequest(request, () => {
      throw new Error("password=do-not-log-this");
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." },
    });

    const logLine = String(errorLog.mock.calls[0]?.[0]);
    expect(logLine).toContain("INTERNAL_ERROR");
    expect(logLine).not.toContain("do-not-log-this");
    expect(logLine).not.toContain("token=");
  });
});

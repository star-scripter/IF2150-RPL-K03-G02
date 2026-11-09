import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "../server/api/errors";
import { handleApiRequest } from "../server/api/handler";
import { apiFailure, apiList, apiSuccess } from "../server/api/responses";
import { parseFormData, parseJsonBody, parseQuery, validateInput } from "../server/api/validation";

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

  it("rejects undefined data instead of serializing an empty success envelope", () => {
    expect(() => apiSuccess(undefined)).toThrow(ApiError);
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

  it("maps configured empty required fields to DATA_TIDAK_LENGKAP", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ judul: "   " }),
    });

    await expect(
      parseJsonBody(request, z.object({ judul: z.string().min(1) }), {
        requiredFields: ["judul"],
      }),
    ).rejects.toMatchObject({
      code: "DATA_TIDAK_LENGKAP",
      fields: { judul: expect.any(String) },
    });
  });

  it("keeps a present value with the wrong type as FORMAT_TIDAK_VALID", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ judul: 42 }),
    });

    await expect(
      parseJsonBody(request, z.object({ judul: z.string().min(1) }), {
        requiredFields: ["judul"],
      }),
    ).rejects.toMatchObject({ code: "FORMAT_TIDAK_VALID" });
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

  it("parses and validates query parameters, including Zod async refinements", async () => {
    const request = new Request("http://localhost/api/laporan?page=2&limit=6");
    const schema = z
      .object({ page: z.coerce.number().int(), limit: z.coerce.number().int() })
      .refine(async (query) => query.page > 0 && query.limit > 0);

    await expect(parseQuery(request, schema)).resolves.toEqual({ page: 2, limit: 6 });
  });

  it("parses and validates multipart form fields", async () => {
    const form = new FormData();
    form.set("judul", "Pembersihan Pantai");
    const request = new Request("http://localhost/api/test", { method: "POST", body: form });

    await expect(parseFormData(request, z.object({ judul: z.string() }))).resolves.toEqual({
      judul: "Pembersihan Pantai",
    });
  });

  it("rejects multipart fields repeated for a single-file schema", async () => {
    const form = new FormData();
    form.append("file", new File(["first"], "first.txt", { type: "text/plain" }));
    form.append("file", new File(["second"], "second.jpg", { type: "image/jpeg" }));
    const request = new Request("http://localhost/api/media", { method: "POST", body: form });
    const schema = z.object({ file: z.instanceof(File).refine((file) => file.type === "image/jpeg") });

    await expect(parseFormData(request, schema)).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
      fields: { file: expect.any(String) },
    });
  });

  it("preserves repeated multipart fields for array schemas", async () => {
    const form = new FormData();
    form.append("tag", "sebelum");
    form.append("tag", "sesudah");
    const request = new Request("http://localhost/api/test", { method: "POST", body: form });

    await expect(parseFormData(request, z.object({ tag: z.array(z.string()) }))).resolves.toEqual({
      tag: ["sebelum", "sesudah"],
    });
  });

  it("rejects URL-encoded requests passed to the multipart parser", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: new URLSearchParams({ judul: "pantai" }),
    });

    await expect(parseFormData(request, z.object({ judul: z.string() }))).rejects.toMatchObject({
      code: "FORMAT_TIDAK_VALID",
    });
  });

  it("maps an already-consumed request body to INTERNAL_ERROR", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: "Budi" }),
    });
    await request.json();

    await expect(parseJsonBody(request, z.object({ nama: z.string() }))).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });

  it("maps an already-consumed multipart body to INTERNAL_ERROR", async () => {
    const form = new FormData();
    form.set("judul", "Pembersihan Pantai");
    const request = new Request("http://localhost/api/test", { method: "POST", body: form });
    await request.formData();

    await expect(parseFormData(request, z.object({ judul: z.string() }))).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });

  it("keeps prototype-named record fields in the error map", async () => {
    let thrown: unknown;
    try {
      await validateInput(
        { constructor: 1, toString: 2 },
        z.record(z.string(), z.number().min(3)),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    if (!(thrown instanceof ApiError)) return;
    expect(Object.hasOwn(thrown.fields ?? {}, "constructor")).toBe(true);
    expect(Object.hasOwn(thrown.fields ?? {}, "toString")).toBe(true);
  });

  it("does not echo unknown strict-object field names in validation messages", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: "Budi", secretPassword: "not-for-logs" }),
    });

    let thrown: unknown;
    try {
      await parseJsonBody(request, z.strictObject({ nama: z.string() }));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    if (!(thrown instanceof ApiError)) return;
    expect(JSON.stringify(thrown.fields)).not.toContain("secretPassword");
    expect(JSON.stringify(thrown.fields)).not.toContain("not-for-logs");
    expect(thrown.fields?._request).toBe("Request berisi field yang tidak dikenal.");
  });
});

describe("API route error boundary", () => {
  it("returns a known ApiError using its contract status and envelope", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request("http://localhost/api/reward/9");
    const response = await handleApiRequest(request, "/api/reward/[id]", () => {
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
    const response = await handleApiRequest(request, "/api/test", () => {
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
    const request = new Request("http://localhost/api/laporan/dynamic-id?token=do-not-log-this");
    const error = new Error("database error");
    error.name = "secret-name-do-not-log";
    const response = await handleApiRequest(request, "/api/laporan/[id]", () => {
      throw error;
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." },
    });

    const logLine = String(errorLog.mock.calls[0]?.[0]);
    expect(logLine).toContain("INTERNAL_ERROR");
    expect(logLine).not.toContain("do-not-log-this");
    expect(logLine).not.toContain("secret-name-do-not-log");
    expect(logLine).toContain("/api/laporan/[id]");
    expect(logLine).not.toContain("dynamic-id");
    expect(logLine).not.toContain("token=");
  });

  it("logs the contract error code for a controller-returned error response", async () => {
    const warnLog = vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request("http://localhost/api/reward/9");

    await handleApiRequest(request, "/api/reward/[id]", () =>
      apiFailure(new ApiError("NOT_FOUND", "Reward tidak ditemukan.")),
    );

    const logRecord = JSON.parse(String(warnLog.mock.calls[0]?.[0])) as {
      errorCode?: string;
      route?: string;
    };
    expect(logRecord.errorCode).toBe("NOT_FOUND");
    expect(logRecord.route).toBe("/api/reward/[id]");
  });

  it("rethrows Next.js request-time control-flow errors instead of mapping them to 500", async () => {
    const dynamicError = Object.assign(new Error("request-time API used during prerender"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    const request = new Request("http://localhost/api/me");

    await expect(
      handleApiRequest(request, "/api/me", () => {
        throw dynamicError;
      }),
    ).rejects.toBe(dynamicError);
  });
});

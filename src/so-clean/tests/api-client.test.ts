import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ApiError, api, aturPenangananSesiHabis, tahanRequestSampai } from "../lib/api/client";
import { PESAN_ERROR, isKodeError } from "../lib/api/pesan-error";
import type { KodeError } from "../types/api";

// Server kosong: setiap test memasang handler sendiri lewat server.use().
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function tangkap(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Seharusnya melempar ApiError");
}

describe("api client: respons sukses", () => {
  it("mengembalikan isi `data`", async () => {
    server.use(http.get("*/api/me", () => HttpResponse.json({ data: { id: "u1", nama: "A" } })));
    await expect(api.get("/api/me")).resolves.toEqual({ id: "u1", nama: "A" });
  });

  it("mengembalikan `data` dan `meta` untuk endpoint list", async () => {
    const meta = { page: 2, limit: 6, total: 13 };
    server.use(http.get("*/api/laporan", () => HttpResponse.json({ data: [{ idLaporan: 1 }], meta })));
    await expect(api.getList("/api/laporan")).resolves.toEqual({ data: [{ idLaporan: 1 }], meta });
  });

  it("mengirim query tanpa nilai undefined/null", async () => {
    let query = "";
    server.use(
      http.get("*/api/laporan", ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({ data: [], meta: { page: 1, limit: 6, total: 0 } });
      }),
    );
    await api.getList("/api/laporan", { query: { jenis: "REPORTIT", page: 2, status: undefined, sort: null } });
    expect(query).toBe("?jenis=REPORTIT&page=2");
  });

  it("mengirim body sebagai JSON", async () => {
    let diterima: unknown;
    let contentType: string | null = null;
    server.use(
      http.post("*/api/auth/login", async ({ request }) => {
        contentType = request.headers.get("content-type");
        diterima = await request.json();
        return HttpResponse.json({ data: { ok: true } });
      }),
    );
    await api.post("/api/auth/login", { email: "a@b.c", password: "rahasia123" });
    expect(contentType).toBe("application/json");
    expect(diterima).toEqual({ email: "a@b.c", password: "rahasia123" });
  });

  it("mengirim FormData sebagai multipart, bukan JSON", async () => {
    let contentType: string | null = null;
    let namaFile: string | undefined;
    server.use(
      http.post("*/api/media", async ({ request }) => {
        contentType = request.headers.get("content-type");
        const file = (await request.formData()).get("file");
        namaFile = file instanceof File ? file.name : undefined;
        return HttpResponse.json({ data: { idMedia: 1, url: "x", tipe: "FOTO" } });
      }),
    );
    const form = new FormData();
    form.append("file", new File(["isi"], "foto.png", { type: "image/png" }));
    await api.post("/api/media", form);
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(namaFile).toBe("foto.png");
  });
});

describe("api client: menunggu mock siap", () => {
  it("menahan request sampai promise penunda selesai", async () => {
    let dipanggil = false;
    server.use(
      http.get("*/api/me", () => {
        dipanggil = true;
        return HttpResponse.json({ data: { id: "u1" } });
      }),
    );
    let selesai!: () => void;
    tahanRequestSampai(new Promise<void>((resolve) => (selesai = resolve)));
    const request = api.get("/api/me");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(dipanggil).toBe(false);
    selesai();
    await expect(request).resolves.toEqual({ id: "u1" });
    expect(dipanggil).toBe(true);
  });

  it("tetap mengirim request walaupun penunda gagal", async () => {
    server.use(http.get("*/api/me", () => HttpResponse.json({ data: { id: "u2" } })));
    tahanRequestSampai(Promise.reject(new Error("worker gagal")));
    await expect(api.get("/api/me")).resolves.toEqual({ id: "u2" });
  });
});

describe("api client: respons gagal", () => {
  it("mengubah `{ error }` menjadi ApiError dengan pesan Indonesia", async () => {
    server.use(
      http.post("*/api/auth/login", () =>
        HttpResponse.json(
          { error: { code: "LOGIN_GAGAL", message: "Invalid credentials" } },
          { status: 401 },
        ),
      ),
    );
    const error = await tangkap(api.post("/api/auth/login", {}));
    expect(error.code).toBe("LOGIN_GAGAL");
    expect(error.status).toBe(401);
    expect(error.message).toBe(PESAN_ERROR.LOGIN_GAGAL);
    expect(error.pesanServer).toBe("Invalid credentials");
  });

  it("meneruskan `fields` untuk error validasi", async () => {
    const fields = { email: "Format email tidak valid.", password: "Password harus 8–72 karakter." };
    server.use(
      http.post("*/api/auth/register", () =>
        HttpResponse.json(
          { error: { code: "FORMAT_TIDAK_VALID", message: "x", fields } },
          { status: 400 },
        ),
      ),
    );
    const error = await tangkap(api.post("/api/auth/register", {}));
    expect(error.code).toBe("FORMAT_TIDAK_VALID");
    expect(error.fields).toEqual(fields);
  });

  it("menganggap kode error yang tidak dikenal sebagai INTERNAL_ERROR", async () => {
    server.use(
      http.get("*/api/me", () =>
        HttpResponse.json({ error: { code: "KODE_ANEH", message: "?" } }, { status: 418 }),
      ),
    );
    const error = await tangkap(api.get("/api/me"));
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.status).toBe(418);
  });

  it("menangani respons gagal yang bukan JSON", async () => {
    server.use(http.get("*/api/me", () => new HttpResponse("Bad Gateway", { status: 502 })));
    const error = await tangkap(api.get("/api/me"));
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.status).toBe(502);
  });

  it("menangani respons sukses yang tidak berisi `data`", async () => {
    server.use(http.get("*/api/me", () => HttpResponse.json({ id: "u1" })));
    const error = await tangkap(api.get("/api/me"));
    expect(error.code).toBe("INTERNAL_ERROR");
  });

  it("menangani respons list tanpa `meta`", async () => {
    server.use(http.get("*/api/penukaran", () => HttpResponse.json({ data: [] })));
    const error = await tangkap(api.getList("/api/penukaran"));
    expect(error.code).toBe("INTERNAL_ERROR");
  });

  it("mengubah kegagalan jaringan menjadi kode JARINGAN", async () => {
    server.use(http.get("*/api/me", () => HttpResponse.error()));
    const error = await tangkap(api.get("/api/me"));
    expect(error.code).toBe("JARINGAN");
    expect(error.status).toBe(0);
    expect(error.message).toBe(PESAN_ERROR.JARINGAN);
  });
});

describe("pesan error", () => {
  const SEMUA_KODE: KodeError[] = [
    "DATA_TIDAK_LENGKAP", "FORMAT_TIDAK_VALID", "UNAUTHORIZED", "LOGIN_GAGAL", "FORBIDDEN",
    "NOT_FOUND", "EMAIL_TERDAFTAR", "SUDAH_DIVERIFIKASI", "LOKASI_SUDAH_DIBERSIHKAN",
    "CLEANIT_SUDAH_MENUNGGU", "MEDIA_SUDAH_DIGUNAKAN", "FILE_TERLALU_BESAR",
    "TIPE_FILE_TIDAK_DIDUKUNG", "POIN_TIDAK_CUKUP", "STOK_HABIS", "DI_LUAR_WILAYAH",
    "INTERNAL_ERROR",
  ];

  it("setiap kode error kontrak punya pesan", () => {
    for (const kode of SEMUA_KODE) {
      expect(PESAN_ERROR[kode], kode).toBeTruthy();
      expect(isKodeError(kode)).toBe(true);
    }
  });

  it("JARINGAN bukan kode error kontrak", () => {
    expect(isKodeError("JARINGAN")).toBe(false);
    expect(isKodeError("TIDAK_ADA")).toBe(false);
  });
});

describe("api client: sesi habis (FE-05)", () => {
  afterEach(() => aturPenangananSesiHabis(null));

  it("UNAUTHORIZED memanggil penanganan sesi habis", async () => {
    const penangan = vi.fn();
    aturPenangananSesiHabis(penangan);
    server.use(
      http.get("*/api/me", () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "x" } }, { status: 401 }),
      ),
    );
    const error = await tangkap(api.get("/api/me"));
    expect(error.code).toBe("UNAUTHORIZED");
    expect(penangan).toHaveBeenCalledTimes(1);
  });

  it("LOGIN_GAGAL (401) tidak memicu penanganan sesi habis", async () => {
    const penangan = vi.fn();
    aturPenangananSesiHabis(penangan);
    server.use(
      http.post("*/api/auth/login", () =>
        HttpResponse.json({ error: { code: "LOGIN_GAGAL", message: "x" } }, { status: 401 }),
      ),
    );
    await tangkap(api.post("/api/auth/login", {}));
    expect(penangan).not.toHaveBeenCalled();
  });

  it("FORBIDDEN (403) tidak memicu penanganan sesi habis", async () => {
    const penangan = vi.fn();
    aturPenangananSesiHabis(penangan);
    server.use(
      http.get("*/api/laporan", () =>
        HttpResponse.json({ error: { code: "FORBIDDEN", message: "x" } }, { status: 403 }),
      ),
    );
    await tangkap(api.getList("/api/laporan"));
    expect(penangan).not.toHaveBeenCalled();
  });
});

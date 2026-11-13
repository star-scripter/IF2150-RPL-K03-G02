import { describe, expect, it } from "vitest";
import { wajibLogin } from "@/server/auth/guard";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/server/auth/session-token";
import { buatRequest, cookieSesi } from "./helpers/sesi";

const ID = "8f8e2a52-5d3c-4c33-9a4c-6f0e9b1f2a10";

describe("wajibLogin (shim cek sesi dan role)", () => {
  it("mengembalikan sesi dari cookie yang valid", async () => {
    const request = buatRequest("/api/uji", { cookie: await cookieSesi(ID, "MASYARAKAT") });
    await expect(wajibLogin(request)).resolves.toEqual({ idPengguna: ID, role: "MASYARAKAT" });
  });

  it("membaca cookie sesi di antara cookie lain", async () => {
    const cookie = `tema=gelap; ${await cookieSesi(ID, "OPERATOR")}; bahasa=id`;
    await expect(wajibLogin(buatRequest("/api/uji", { cookie }))).resolves.toMatchObject({
      role: "OPERATOR",
    });
  });

  it("menolak request tanpa cookie dengan UNAUTHORIZED", async () => {
    await expect(wajibLogin(buatRequest("/api/uji"))).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  it("menolak token yang dipalsukan dengan UNAUTHORIZED", async () => {
    const token = await signSessionToken({ idPengguna: ID, role: "MASYARAKAT" });
    const [header, payload, signature] = token.split(".");
    const palsu = `${header}.${payload}.${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
    const request = buatRequest("/api/uji", { cookie: `${SESSION_COOKIE_NAME}=${palsu}` });
    await expect(wajibLogin(request)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("menolak token yang sudah kedaluwarsa dengan UNAUTHORIZED", async () => {
    const delapanHariLalu = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const token = await signSessionToken({ idPengguna: ID, role: "MASYARAKAT" }, delapanHariLalu);
    const request = buatRequest("/api/uji", { cookie: `${SESSION_COOKIE_NAME}=${token}` });
    await expect(wajibLogin(request)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("menolak role yang tidak diizinkan dengan FORBIDDEN", async () => {
    const request = buatRequest("/api/uji", { cookie: await cookieSesi(ID, "OPERATOR") });
    await expect(wajibLogin(request, ["MASYARAKAT"])).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("menerima role yang diizinkan", async () => {
    const request = buatRequest("/api/uji", { cookie: await cookieSesi(ID, "OPERATOR") });
    await expect(wajibLogin(request, ["OPERATOR"])).resolves.toMatchObject({ role: "OPERATOR" });
  });
});

import { createHash } from "node:crypto";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, aturPenangananSesiHabis, tahanRequestSampai } from "../lib/api/client";
import { mediaApi } from "../lib/api/endpoints";
import { POST } from "@/app/api/media/route";
import { cookieSesi } from "./helpers/sesi";

const be = vi.hoisted(() => ({ sudahDipakai: vi.fn(), buatMedia: vi.fn(), upload: vi.fn(), getUrl: vi.fn() }));
vi.mock("@/server/models/media", () => ({ sudahDipakai: be.sudahDipakai, buatMedia: be.buatMedia }));
vi.mock("@/server/storage/s3", () => ({ upload: be.upload, getUrl: be.getUrl }));

class XhrUji {
  static daftar: XhrUji[] = [];
  static saatKirim: ((xhr: XhrUji) => void) | undefined;
  upload: { onprogress: ((event: { loaded: number; total: number; lengthComputable: boolean }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0; statusText = ""; responseText = ""; method = ""; url = "";
  withCredentials = false; timeout = 0; dibatalkan = false;
  headers: Record<string, string> = {};
  body: unknown;
  constructor() { XhrUji.daftar.push(this); }
  open(method: string, url: string) { this.method = method; this.url = url; }
  setRequestHeader(nama: string, nilai: string) { this.headers[nama] = nilai; }
  getAllResponseHeaders() { return "content-type: application/json\r\nx-test: xhr"; }
  send(body: unknown) { this.body = body; XhrUji.saatKirim?.(this); }
  abort() { this.dibatalkan = true; this.onabort?.(); }
  progres(loaded: number, total: number, lengthComputable = true) { this.upload.onprogress?.({ loaded, total, lengthComputable }); }
  respons(status: number, body: unknown) { this.status = status; this.responseText = JSON.stringify(body); this.onload?.(); }
}
const file = new File(["bukti"], "bukti.png", { type: "image/png" });
const hasil = { idMedia: 21, url: "https://media.example.test/21.png", tipe: "FOTO" };
async function flush() { for (let i = 0; i < 8; i++) await Promise.resolve(); }

beforeEach(() => {
  XhrUji.daftar = []; XhrUji.saatKirim = undefined;
  vi.stubGlobal("XMLHttpRequest", XhrUji);
  be.sudahDipakai.mockReset().mockResolvedValue(false);
  be.buatMedia.mockReset().mockResolvedValue(21);
  be.upload.mockReset().mockResolvedValue("media/uji.png");
  be.getUrl.mockReset().mockResolvedValue(hasil.url);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { tahanRequestSampai(Promise.resolve()); aturPenangananSesiHabis(null); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("mediaApi.upload dengan progres byte", () => {
  it("mengirim satu File dalam multipart tanpa menimpa boundary browser", async () => {
    const progres = vi.fn(); const tugas = mediaApi.upload(file, { onUploadProgress: progres }); await flush();
    const xhr = XhrUji.daftar[0];
    expect(xhr.method).toBe("POST"); expect(new URL(xhr.url).pathname).toBe("/api/media");
    expect(xhr.body).toBeInstanceOf(FormData); expect((xhr.body as FormData).get("file")).toBe(file);
    expect(xhr.headers).toEqual({ Accept: "application/json" }); expect(xhr.withCredentials).toBe(false);
    xhr.progres(10, 100); xhr.progres(20, 0, false);
    expect(progres.mock.calls).toEqual([[{ loaded: 10, total: 100 }], [{ loaded: 20, total: null }]]);
    xhr.respons(201, { data: hasil }); await expect(tugas).resolves.toEqual(hasil);
  });
  it("menunggu MSW siap sebelum membuka request XHR", async () => {
    let siap!: () => void; tahanRequestSampai(new Promise<void>((resolve) => { siap = resolve; }));
    const tugas = mediaApi.upload(file, { onUploadProgress: vi.fn() }); await flush(); expect(XhrUji.daftar).toHaveLength(0);
    siap(); await flush(); XhrUji.daftar[0].respons(201, { data: hasil }); await expect(tugas).resolves.toEqual(hasil);
  });
  it("abort membatalkan XHR dan tidak menerima progres setelahnya", async () => {
    const pengendali = new AbortController(), progres = vi.fn();
    const tugas = mediaApi.upload(file, { signal: pengendali.signal, onUploadProgress: progres }); await flush();
    pengendali.abort(); XhrUji.daftar[0].progres(100, 100);
    await expect(tugas).rejects.toMatchObject({ name: "AbortError" }); expect(XhrUji.daftar[0].dibatalkan).toBe(true); expect(progres).not.toHaveBeenCalled();
  });
  it("signal yang sudah dibatalkan tidak mengirim file", async () => {
    const pengendali = new AbortController(); pengendali.abort();
    await expect(mediaApi.upload(file, { signal: pengendali.signal, onUploadProgress: vi.fn() })).rejects.toMatchObject({ name: "AbortError" });
    expect(XhrUji.daftar.every((xhr) => xhr.body === undefined)).toBe(true);
  });
  it.each([[409, "MEDIA_SUDAH_DIGUNAKAN"], [413, "FILE_TERLALU_BESAR"], [415, "TIPE_FILE_TIDAK_DIDUKUNG"]] as const)("mempertahankan ApiError %i/%s", async (status, code) => {
    const tugas = mediaApi.upload(file, { onUploadProgress: vi.fn() }); await flush();
    XhrUji.daftar[0].respons(status, { error: { code, message: "detail teknis" } });
    await expect(tugas).rejects.toMatchObject({ code, status, name: "ApiError" });
  });
  it("UNAUTHORIZED tetap memanggil penangan sesi habis FE-05", async () => {
    const sesiHabis = vi.fn(); aturPenangananSesiHabis(sesiHabis);
    const tugas = mediaApi.upload(file, { onUploadProgress: vi.fn() }); await flush();
    XhrUji.daftar[0].respons(401, { error: { code: "UNAUTHORIZED" } });
    await expect(tugas).rejects.toMatchObject({ code: "UNAUTHORIZED", status: 401 }); expect(sesiHabis).toHaveBeenCalledOnce();
  });
  it.each(["onerror", "ontimeout"] as const)("%s menjadi error jaringan yang dapat dicoba lagi", async (event) => {
    const tugas = mediaApi.upload(file, { onUploadProgress: vi.fn() }); await flush(); XhrUji.daftar[0][event]?.();
    await expect(tugas).rejects.toMatchObject({ code: "JARINGAN", status: 0 });
  });
  it("respons sukses tanpa envelope data ditolak", async () => {
    const tugas = mediaApi.upload(file, { onUploadProgress: vi.fn() }); await flush(); XhrUji.daftar[0].respons(201, { salah: true });
    await expect(tugas).rejects.toBeInstanceOf(ApiError);
  });
});

describe("transport FE-11 → route/controller dan pemrosesan BE-08 asli", () => {
  it("mempertahankan file asli, memverifikasi JWT, dan menerima hasil foto ber-watermark", async () => {
    const png = await sharp({ create: { width: 160, height: 100, channels: 3, background: "#05c274" } }).png().toBuffer();
    const bukti = new File([new Uint8Array(png)], "foto-uji.png", { type: "image/png" });
    const cookie = await cookieSesi("pengguna-fe11-uji", "MASYARAKAT");
    XhrUji.saatKirim = (xhr) => {
      void POST(new Request(xhr.url, { method: xhr.method, body: xhr.body as FormData, headers: { cookie } })).then(async (response) => {
        xhr.respons(response.status, await response.json());
      });
    };
    const respons = await mediaApi.upload(bukti, { onUploadProgress: vi.fn() });
    expect(respons).toEqual(hasil);
    expect(be.sudahDipakai).toHaveBeenCalledWith(createHash("sha256").update(png).digest("hex"));
    const blob = be.upload.mock.calls[0][0] as Blob;
    const diproses = Buffer.from(await blob.arrayBuffer());
    expect(diproses.equals(png)).toBe(false);
    expect(await sharp(diproses).metadata()).toMatchObject({ format: "png", width: 160, height: 100 });
    expect(be.buatMedia).toHaveBeenCalledWith(expect.objectContaining({ ukuranByte: png.length, tipe: "FOTO" }));
  });
});

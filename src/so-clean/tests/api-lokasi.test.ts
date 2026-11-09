import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getDaftar } from "@/app/api/lokasi/route";
import { GET as getDetail } from "@/app/api/lokasi/[id]/route";
import {
  DATABASE_TEST_AKTIF,
  buatLokasi,
  buatMedia,
  buatPengguna,
  kosongkanDatabase,
} from "./helpers/db";
import { buatRequest, cookieSesi } from "./helpers/sesi";

function detail(id: string, cookie?: string) {
  return getDetail(buatRequest(`/api/lokasi/${id}`, { cookie }), {
    params: Promise.resolve({ id }),
  });
}

describe.runIf(DATABASE_TEST_AKTIF)("GET /api/lokasi dan /api/lokasi/:id", () => {
  let pelapor: string;
  let operator: string;
  let cookieMasyarakat: string;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("S3_PUBLIC_ENDPOINT", "http://localhost:9000");
    vi.stubEnv("S3_BUCKET", "soclean-media");
    vi.stubEnv("S3_ACCESS_KEY_ID", "kunci-uji");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "rahasia-uji");
    vi.stubEnv("S3_FORCE_PATH_STYLE", "true");

    await kosongkanDatabase();
    pelapor = (await buatPengguna()).id;
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
    cookieMasyarakat = await cookieSesi(pelapor, "MASYARAKAT");
  });

  it("menolak tamu dengan 401 UNAUTHORIZED", async () => {
    const res = await getDaftar(buatRequest("/api/lokasi"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");

    expect((await detail("1")).status).toBe(401);
  });

  it("mengembalikan { data: [] } jika belum ada lokasi TERCEMAR", async () => {
    await buatLokasi({ pelapor, operator, status: "DIBERSIHKAN" });
    const res = await getDaftar(buatRequest("/api/lokasi", { cookie: cookieMasyarakat }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [] });
  });

  it("default status TERCEMAR dan bisa difilter DIBERSIHKAN, juga untuk Operator", async () => {
    const tercemar = await buatLokasi({ pelapor, operator, nama: "Tercemar" });
    const bersih = await buatLokasi({ pelapor, operator, nama: "Bersih", status: "DIBERSIHKAN" });
    const cookieOperator = await cookieSesi(operator, "OPERATOR");

    const resDefault = await getDaftar(buatRequest("/api/lokasi", { cookie: cookieOperator }));
    const { data: dataDefault } = await resDefault.json();
    expect(dataDefault.map((l: { idLokasi: number }) => l.idLokasi)).toEqual([tercemar.idLokasi]);

    const resBersih = await getDaftar(
      buatRequest("/api/lokasi?status=DIBERSIHKAN", { cookie: cookieMasyarakat }),
    );
    const { data: dataBersih } = await resBersih.json();
    expect(dataBersih.map((l: { idLokasi: number }) => l.idLokasi)).toEqual([bersih.idLokasi]);
  });

  it("menolak status yang tidak dikenal dengan 400 FORMAT_TIDAK_VALID", async () => {
    const res = await getDaftar(buatRequest("/api/lokasi?status=SEMUA", { cookie: cookieMasyarakat }));
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.code).toBe("FORMAT_TIDAK_VALID");
    expect(error.fields).toHaveProperty("status");
  });

  it("mengembalikan LokasiDetail dengan presigned URL media laporan asal", async () => {
    const { idLokasi, idLaporanAsal } = await buatLokasi({ pelapor, operator, poin: 100 });
    const foto = await buatMedia({ idPengguna: pelapor, laporanId: idLaporanAsal });

    const res = await detail(String(idLokasi), cookieMasyarakat);
    expect(res.status).toBe(200);
    const { data } = await res.json();

    expect(data).toMatchObject({ idLokasi, poin: 100, status: "TERCEMAR" });
    expect(data.laporanAsal).toMatchObject({ idLaporan: idLaporanAsal, sumber: "PENGAMATAN_PRIBADI" });
    expect(data.laporanAsal.media).toHaveLength(1);
    const [media] = data.laporanAsal.media;
    expect(Object.keys(media).sort()).toEqual(["createdAt", "idMedia", "tipe", "url"]);
    expect(media.idMedia).toBe(foto.idMedia);
    const url = new URL(media.url);
    expect(url.origin + url.pathname).toBe(`http://localhost:9000/soclean-media/${foto.storageKey}`);
    expect(url.searchParams.has("X-Amz-Signature")).toBe(true);
  });

  it.each(["abc", "0", "-1", "1.5", "99999999999"])(
    "menolak ID %s dengan 400 FORMAT_TIDAK_VALID",
    async (id) => {
      const res = await detail(id, cookieMasyarakat);
      expect(res.status).toBe(400);
      const { error } = await res.json();
      expect(error.code).toBe("FORMAT_TIDAK_VALID");
      expect(error.fields).toHaveProperty("id");
    },
  );

  it("mengembalikan 404 NOT_FOUND untuk lokasi yang tidak ada", async () => {
    const res = await detail("4242", cookieMasyarakat);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("NOT_FOUND");
  });
});

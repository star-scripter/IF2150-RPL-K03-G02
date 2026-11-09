import { beforeEach, describe, expect, it } from "vitest";
import { get_all_lokasi_valid, get_lokasi } from "@/server/models/lokasi";
import {
  DATABASE_TEST_AKTIF,
  buatLokasi,
  buatMedia,
  buatPengguna,
  kosongkanDatabase,
} from "./helpers/db";

describe.runIf(DATABASE_TEST_AKTIF)("model Lokasi (C06)", () => {
  let pelapor: string;
  let operator: string;

  beforeEach(async () => {
    await kosongkanDatabase();
    pelapor = (await buatPengguna()).id;
    operator = (await buatPengguna({ role: "OPERATOR" })).id;
  });

  it("mengembalikan list kosong jika belum ada lokasi", async () => {
    await expect(get_all_lokasi_valid()).resolves.toEqual([]);
  });

  it("default hanya TERCEMAR, urut laporan asal terbaru, dengan dilaporkanAt dari laporan asal", async () => {
    const lama = await buatLokasi({
      pelapor,
      operator,
      nama: "Lama",
      dilaporkanAt: new Date("2026-11-01T02:00:00Z"),
    });
    const baru = await buatLokasi({
      pelapor,
      operator,
      nama: "Baru",
      poin: 200,
      dilaporkanAt: new Date("2026-11-05T02:00:00Z"),
    });
    await buatLokasi({ pelapor, operator, nama: "Bersih", status: "DIBERSIHKAN" });

    const hasil = await get_all_lokasi_valid();

    expect(hasil.map((l) => l.idLokasi)).toEqual([baru.idLokasi, lama.idLokasi]);
    expect(hasil[0]).toEqual({
      idLokasi: baru.idLokasi,
      nama: "Baru",
      alamat: "Jl. Uji No. 1",
      latitude: -6.885,
      longitude: 107.6065,
      jenisSampah: "PLASTIK",
      status: "TERCEMAR",
      poin: 200,
      dilaporkanAt: "2026-11-05T02:00:00.000Z",
    });
  });

  it("memfilter status DIBERSIHKAN", async () => {
    await buatLokasi({ pelapor, operator, nama: "Tercemar" });
    const bersih = await buatLokasi({ pelapor, operator, nama: "Bersih", status: "DIBERSIHKAN" });

    const hasil = await get_all_lokasi_valid("DIBERSIHKAN");
    expect(hasil.map((l) => l.idLokasi)).toEqual([bersih.idLokasi]);
  });

  it("get_lokasi mengembalikan laporan asal beserta media", async () => {
    const { idLokasi, idLaporanAsal } = await buatLokasi({
      pelapor,
      operator,
      judul: "Tumpukan plastik",
      sumber: "INFO_WARGA",
      waktuKejadian: new Date("2026-11-03T01:30:00Z"),
      status: "DIBERSIHKAN",
    });
    const foto = await buatMedia({
      idPengguna: pelapor,
      laporanId: idLaporanAsal,
      createdAt: new Date("2026-11-03T02:00:00Z"),
    });
    const video = await buatMedia({ idPengguna: pelapor, laporanId: idLaporanAsal, tipe: "VIDEO" });
    await buatMedia({ idPengguna: pelapor, laporanId: null }); // belum tertaut, tidak ikut

    const detail = await get_lokasi(idLokasi);

    expect(detail).toMatchObject({ idLokasi, status: "DIBERSIHKAN" });
    expect(detail?.laporanAsal).toEqual({
      idLaporan: idLaporanAsal,
      judul: "Tumpukan plastik",
      waktu: "2026-11-03T01:30:00.000Z",
      sumber: "INFO_WARGA",
      media: [
        {
          idMedia: foto.idMedia,
          tipe: "FOTO",
          storageKey: foto.storageKey,
          createdAt: "2026-11-03T02:00:00.000Z",
        },
        expect.objectContaining({ idMedia: video.idMedia, tipe: "VIDEO" }),
      ],
    });
  });

  it("get_lokasi mengembalikan null jika lokasi tidak ada", async () => {
    await expect(get_lokasi(999)).resolves.toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  bacaFilterValidasi,
  bodySetujui,
  bodyTolak,
  cekAlasanTolak,
  cekIsianSetujui,
  formatIdLaporan,
  formatJarak,
  formatKoordinat,
  formatWaktuKirim,
  formatWaktuLengkap,
  formatWaktuUnggah,
  pesanSetujui,
  tindakanGagalVerifikasi,
  urlValidasi,
} from "../lib/laporan";
import type { LaporanDetail } from "../types/api";

describe("formatIdLaporan", () => {
  it.each([
    [248, "RPT-0248"],
    [7, "RPT-0007"],
    [12345, "RPT-12345"],
  ])("%i → %s", (id, hasil) => {
    expect(formatIdLaporan(id)).toBe(hasil);
  });
});

function param(query: string) {
  return new URLSearchParams(query);
}

describe("bacaFilterValidasi", () => {
  it("tanpa query → ReportIt, terbaru, halaman 1", () => {
    expect(bacaFilterValidasi(param(""))).toEqual({ jenis: "REPORTIT", sort: "terbaru", page: 1 });
  });

  it("membaca tab CleanIt, urutan terlama, dan halaman", () => {
    expect(bacaFilterValidasi(param("jenis=cleanit&sort=terlama&page=3"))).toEqual({
      jenis: "CLEANIT",
      sort: "terlama",
      page: 3,
    });
  });

  it("nilai tidak dikenal jatuh ke default", () => {
    expect(bacaFilterValidasi(param("jenis=CLEANIT&sort=acak"))).toEqual({
      jenis: "REPORTIT",
      sort: "terbaru",
      page: 1,
    });
  });

  it.each(["0", "-1", "abc", "1.5", "2e3", "", "1000001"])("page=%s dianggap halaman 1", (page) => {
    expect(bacaFilterValidasi(param(`page=${page}`)).page).toBe(1);
  });

  it("page maksimum 1.000.000 diterima", () => {
    expect(bacaFilterValidasi(param("page=1000000")).page).toBe(1_000_000);
  });
});

describe("urlValidasi", () => {
  it("nilai default tidak ditulis", () => {
    expect(urlValidasi({ jenis: "REPORTIT", sort: "terbaru", page: 1 })).toBe("/operator/laporan");
  });

  it("menulis tab, urutan, dan halaman", () => {
    expect(urlValidasi({ jenis: "CLEANIT", sort: "terlama", page: 2 })).toBe(
      "/operator/laporan?jenis=cleanit&sort=terlama&page=2",
    );
  });

  it("hasilnya terbaca kembali menjadi filter yang sama", () => {
    const filter = { jenis: "CLEANIT", sort: "terbaru", page: 4 } as const;
    const query = urlValidasi(filter).split("?")[1];
    expect(bacaFilterValidasi(param(query))).toEqual(filter);
  });
});

describe("formatWaktuKirim", () => {
  const sekarang = Date.parse("2026-11-10T05:00:00Z");
  const lalu = (ms: number) => new Date(sekarang - ms).toISOString();
  const MENIT = 60_000;

  it.each([
    [0, "Baru saja"],
    [59_000, "Baru saja"],
    [MENIT, "1 menit lalu"],
    [15 * MENIT, "15 menit lalu"],
    [60 * MENIT, "1 jam lalu"],
    [23 * 60 * MENIT + 59 * MENIT, "23 jam lalu"],
    [24 * 60 * MENIT, "1 hari lalu"],
    [6 * 24 * 60 * MENIT, "6 hari lalu"],
  ])("selisih %i ms → %s", (ms, hasil) => {
    expect(formatWaktuKirim(lalu(ms), sekarang)).toBe(hasil);
  });

  it("7 hari atau lebih ditulis tanggal WIB", () => {
    // 2026-10-28T20:24Z = 29 Okt 2026 03.24 WIB
    expect(formatWaktuKirim("2026-10-28T20:24:00Z", sekarang)).toBe("29 Okt 2026");
  });

  it("waktu sedikit di masa depan tidak menghasilkan angka negatif", () => {
    expect(formatWaktuKirim(new Date(sekarang + 30_000).toISOString(), sekarang)).toBe("Baru saja");
  });
});

describe("formatWaktuLengkap", () => {
  it("tanggal panjang dan jam WIB seperti mockup I-08", () => {
    expect(formatWaktuLengkap("2023-10-14T03:45:00Z")).toBe("14 Oktober 2023, 10.45 WIB");
  });
});

const REPORTIT: LaporanDetail = {
  idLaporan: 6,
  jenis: "REPORTIT",
  judul: "Botol plastik di dekat jembatan",
  lokasi: "Teras Cikapundung",
  latitude: -6.88518,
  longitude: 107.6065,
  waktu: "2026-11-10T01:00:00Z",
  createdAt: "2026-11-10T02:00:00Z",
  sumber: "PENGAMATAN_PRIBADI",
  jenisSampah: "PLASTIK",
  status: "BELUM_DIPERIKSA",
  media: [],
  pelapor: { id: "11111111-1111-4111-8111-111111111111", nama: "Dapin Tampan" },
  lokasiId: null,
  alasanPenolakan: null,
  lokasiTerdekat: null,
  laporanAsal: null,
  pelaporAsalSama: null,
  jumlahBersihkanSendiri30Hari: null,
};

const DIGABUNG: LaporanDetail = {
  ...REPORTIT,
  lokasiTerdekat: { idLokasi: 1, nama: "Bantaran Teras Cikapundung", jarakMeter: 20 },
};

const CLEANIT: LaporanDetail = {
  ...REPORTIT,
  idLaporan: 8,
  jenis: "CLEANIT",
  sumber: null,
  lokasiId: 1,
  laporanAsal: { idLaporan: 1, judul: "Tumpukan plastik", waktu: "2026-10-28T03:00:00Z", media: [] },
  pelaporAsalSama: true,
  jumlahBersihkanSendiri30Hari: 0,
};

describe("format detail laporan (I-08)", () => {
  it("waktu unggah foto memakai tanggal pendek dan jam WIB", () => {
    expect(formatWaktuUnggah("2023-10-14T03:45:00Z")).toBe("Diunggah 14 Okt 2023, 10.45 WIB");
  });

  it.each([
    [20, "20 m"],
    [31.6, "32 m"],
    [1234, "1.234 m"],
  ])("jarak %d → %s", (meter, hasil) => {
    expect(formatJarak(meter)).toBe(hasil);
  });

  it("koordinat 5 angka desimal", () => {
    expect(formatKoordinat(-6.88518, 107.6065)).toBe("-6.88518, 107.60650");
  });
});

describe("bodySetujui dan cekIsianSetujui", () => {
  const isian = { poin: 100 as const, namaLokasi: "  Jembatan Cikapundung  " };

  it("ReportIt tanpa lokasi terdekat mengirim poin dan nama yang di-trim", () => {
    expect(bodySetujui(REPORTIT, isian)).toEqual({ poin: 100, namaLokasi: "Jembatan Cikapundung" });
    expect(cekIsianSetujui(REPORTIT, isian)).toEqual({});
  });

  it("ReportIt yang digabung (K13) dan CleanIt mengirim body kosong tanpa validasi isian", () => {
    expect(bodySetujui(DIGABUNG, isian)).toEqual({});
    expect(bodySetujui(CLEANIT, isian)).toEqual({});
    expect(cekIsianSetujui(DIGABUNG, { poin: 50, namaLokasi: "" })).toEqual({});
  });

  it("nama lokasi kosong atau lebih dari 255 karakter ditolak", () => {
    expect(cekIsianSetujui(REPORTIT, { poin: 50, namaLokasi: "   " })).toHaveProperty("namaLokasi");
    expect(cekIsianSetujui(REPORTIT, { poin: 50, namaLokasi: "a".repeat(256) })).toHaveProperty(
      "namaLokasi",
    );
    expect(cekIsianSetujui(REPORTIT, { poin: 50, namaLokasi: "a".repeat(255) })).toEqual({});
  });
});

describe("bodyTolak dan cekAlasanTolak", () => {
  it("alasan di-trim; alasan kosong tidak dikirim", () => {
    expect(bodyTolak("  Foto buram  ")).toEqual({ alasan: "Foto buram" });
    expect(bodyTolak("   ")).toEqual({});
  });

  it("alasan wajib untuk CleanIt, opsional untuk ReportIt", () => {
    expect(cekAlasanTolak("CLEANIT", " ")).toHaveProperty("alasan");
    expect(cekAlasanTolak("CLEANIT", "Foto sesudah tidak di lokasi yang sama")).toEqual({});
    expect(cekAlasanTolak("REPORTIT", "")).toEqual({});
  });
});

describe("pesanSetujui", () => {
  it("ReportIt membuat lokasi baru", () => {
    expect(pesanSetujui(REPORTIT, { idLaporan: 6, status: "VALID", idLokasi: 9, digabung: false })).toBe(
      "Laporan disetujui. Lokasi baru ditambahkan ke daftar CleanIt.",
    );
  });

  it("ReportIt digabung menyebut nama lokasi terdekat", () => {
    expect(pesanSetujui(DIGABUNG, { idLaporan: 6, status: "VALID", idLokasi: 1, digabung: true })).toBe(
      "Laporan disetujui dan digabung ke Bantaran Teras Cikapundung.",
    );
  });

  it("CleanIt menyebut poin yang diberikan kepada pelapor", () => {
    expect(pesanSetujui(CLEANIT, { idLaporan: 8, status: "VALID", poinDiberikan: 100 })).toBe(
      "Laporan disetujui. 100 poin diberikan kepada Dapin Tampan.",
    );
  });
});

describe("tindakanGagalVerifikasi", () => {
  it.each(["SUDAH_DIVERIFIKASI", "LOKASI_SUDAH_DIBERSIHKAN", "NOT_FOUND"] as const)(
    "%s → selesai (tombol dikunci, list di-refresh)",
    (code) => {
      expect(tindakanGagalVerifikasi(code)).toBe("selesai");
    },
  );

  it.each(["FORMAT_TIDAK_VALID", "DATA_TIDAK_LENGKAP"] as const)("%s → isian", (code) => {
    expect(tindakanGagalVerifikasi(code)).toBe("isian");
  });

  it.each(["INTERNAL_ERROR", "JARINGAN", "FORBIDDEN"] as const)("%s → ulang", (code) => {
    expect(tindakanGagalVerifikasi(code)).toBe("ulang");
  });
});

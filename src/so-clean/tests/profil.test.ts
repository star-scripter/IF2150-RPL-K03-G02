/** Logika halaman Profil (FE-24): teks notifikasi, jumlah belum dibaca, waktu WIB, inisial. */
import { describe, expect, it } from "vitest";
import {
  LABEL_JENIS_LAPORAN,
  LABEL_STATUS_NOTIFIKASI,
  alasanNotifikasi,
  formatWaktuNotifikasi,
  inisialNama,
  jumlahBelumDibaca,
  pesanNotifikasi,
} from "../lib/profil";
import type { Notifikasi } from "../types/api";

function notifikasi(ubah: Partial<Notifikasi> = {}): Notifikasi {
  return {
    idLaporan: 1,
    jenis: "REPORTIT",
    judul: "Sampah plastik di pantai",
    status: "VALID",
    alasanPenolakan: null,
    poinDiberikan: null,
    waktu: "2026-10-28T03:24:00Z",
    dibaca: false,
    ...ubah,
  };
}

describe("pesanNotifikasi", () => {
  it("ReportIt disetujui tanpa menyebut poin (N1)", () => {
    const pesan = pesanNotifikasi(notifikasi());
    expect(pesan).toContain("disetujui");
    expect(pesan).not.toContain("poin");
  });

  it("ReportIt ditolak", () => {
    expect(pesanNotifikasi(notifikasi({ status: "TIDAK_VALID" }))).toContain("ditolak");
  });

  it("CleanIt disetujui menyebut poin yang diberikan", () => {
    const pesan = pesanNotifikasi(notifikasi({ jenis: "CLEANIT", poinDiberikan: 200 }));
    expect(pesan).toContain("disetujui");
    expect(pesan).toContain("200 poin");
  });

  it("CleanIt disetujui tanpa poinDiberikan tidak menulis angka kosong", () => {
    const pesan = pesanNotifikasi(notifikasi({ jenis: "CLEANIT", poinDiberikan: null }));
    expect(pesan).not.toMatch(/null|undefined|poin/);
  });

  it("CleanIt ditolak", () => {
    const pesan = pesanNotifikasi(
      notifikasi({ jenis: "CLEANIT", status: "TIDAK_VALID", alasanPenolakan: "Foto buram" }),
    );
    expect(pesan).toContain("ditolak");
  });
});

describe("alasanNotifikasi", () => {
  it("mengembalikan alasan penolakan yang sudah dirapikan", () => {
    expect(
      alasanNotifikasi(notifikasi({ status: "TIDAK_VALID", alasanPenolakan: "  Foto buram  " })),
    ).toBe("Foto buram");
  });

  it("null untuk ReportIt yang ditolak tanpa alasan atau alasan kosong", () => {
    expect(alasanNotifikasi(notifikasi({ status: "TIDAK_VALID" }))).toBeNull();
    expect(alasanNotifikasi(notifikasi({ status: "TIDAK_VALID", alasanPenolakan: "   " }))).toBeNull();
  });

  it("null untuk notifikasi yang disetujui", () => {
    expect(alasanNotifikasi(notifikasi({ alasanPenolakan: "sisa data" }))).toBeNull();
  });
});

describe("jumlahBelumDibaca", () => {
  it("menghitung notifikasi dengan dibaca = false", () => {
    expect(
      jumlahBelumDibaca([
        notifikasi({ idLaporan: 1 }),
        notifikasi({ idLaporan: 2, dibaca: true }),
        notifikasi({ idLaporan: 3 }),
      ]),
    ).toBe(2);
    expect(jumlahBelumDibaca([])).toBe(0);
  });
});

describe("label", () => {
  it("jenis dan status punya label Indonesia", () => {
    expect(LABEL_JENIS_LAPORAN).toEqual({ REPORTIT: "ReportIt", CLEANIT: "CleanIt" });
    expect(LABEL_STATUS_NOTIFIKASI).toEqual({ VALID: "Disetujui", TIDAK_VALID: "Ditolak" });
  });
});

describe("formatWaktuNotifikasi", () => {
  it("menampilkan waktu UTC dalam WIB", () => {
    expect(formatWaktuNotifikasi("2026-10-28T03:24:00Z")).toBe("28 Okt 2026, 10.24");
  });

  it("melewati pergantian hari WIB", () => {
    expect(formatWaktuNotifikasi("2026-10-28T18:05:00Z")).toBe("29 Okt 2026, 01.05");
  });
});

describe("inisialNama", () => {
  it("huruf pertama nama dalam huruf besar, spasi tepi diabaikan", () => {
    expect(inisialNama("  rina")).toBe("R");
    expect(inisialNama("Operator SoClean")).toBe("O");
  });

  it("nama kosong → ?", () => {
    expect(inisialNama("   ")).toBe("?");
  });
});

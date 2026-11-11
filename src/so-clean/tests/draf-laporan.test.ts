/** Draf offline form laporan (FE-13, N5). */
import { describe, expect, it } from "vitest";
import {
  bacaDraf,
  drafDariState,
  hapusDraf,
  isFormKosong,
  kunciDraf,
  simpanDraf,
  type PenyimpananDraf,
} from "../lib/draf-laporan";
import {
  buatStateFormLaporan,
  reducerFormLaporan,
  type MediaFormLaporan,
  type StateFormLaporan,
} from "../lib/form-laporan";

const informasi = {
  judul: "Sampah di Cikapundung",
  lokasi: "Tepi Sungai Cikapundung, Bandung",
  latitude: -6.885,
  longitude: 107.607,
  waktu: "2026-11-08T14:30",
  sumber: "PENGAMATAN_PRIBADI" as const,
  jenisSampah: "PLASTIK" as const,
};

const KUNCI = kunciDraf({ jenis: "REPORTIT" });
const SEKARANG = new Date("2026-11-10T03:00:00Z");

function penyimpananPalsu(awal: Record<string, string> = {}) {
  const isi = new Map(Object.entries(awal));
  const penyimpanan: PenyimpananDraf = {
    getItem: (kunci) => isi.get(kunci) ?? null,
    setItem: (kunci, nilai) => void isi.set(kunci, nilai),
    removeItem: (kunci) => void isi.delete(kunci),
  };
  return { isi, penyimpanan };
}

/** Penyimpanan yang selalu gagal, mis. mode privat atau kuota penuh. */
const penyimpananRusak: PenyimpananDraf = {
  getItem: () => { throw new Error("SecurityError"); },
  setItem: () => { throw new DOMException("penuh", "QuotaExceededError"); },
  removeItem: () => { throw new Error("SecurityError"); },
};

function media(nama: string): MediaFormLaporan {
  return { idLokal: nama, berkas: new File(["x"], nama, { type: "image/png" }), unggahan: null };
}

function stateTerisi(): StateFormLaporan {
  return reducerFormLaporan(buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }), {
    tipe: "informasi",
    perubahan: informasi,
  });
}

describe("kunciDraf", () => {
  it("satu draf ReportIt, dan satu draf CleanIt per lokasi", () => {
    expect(kunciDraf({ jenis: "REPORTIT" })).toBe("soclean:draf-laporan:reportit");
    expect(kunciDraf({ jenis: "CLEANIT", lokasiId: 3, namaLokasi: "Cikapundung" })).toBe(
      "soclean:draf-laporan:cleanit:3",
    );
    expect(kunciDraf({ jenis: "CLEANIT", lokasiId: 4, namaLokasi: "Cikapundung" })).not.toBe(
      kunciDraf({ jenis: "CLEANIT", lokasiId: 3, namaLokasi: "Cikapundung" }),
    );
  });
});

describe("isFormKosong", () => {
  it("form baru kosong; isian atau media membuatnya tidak kosong", () => {
    const awal = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } });
    expect(isFormKosong(awal)).toBe(true);
    expect(isFormKosong(stateTerisi())).toBe(false);
    expect(isFormKosong(reducerFormLaporan(awal, { tipe: "tambah-media", media: [media("a.png")] }))).toBe(false);
  });

  it("judul bawaan CleanIt belum dianggap isian", () => {
    const awal = buatStateFormLaporan({
      konfigurasi: { jenis: "CLEANIT", lokasiId: 3, namaLokasi: "Cikapundung" },
    });
    expect(awal.informasi.judul).not.toBe("");
    expect(isFormKosong(awal)).toBe(true);
  });

  it("form yang di-reset kembali kosong", () => {
    expect(isFormKosong(reducerFormLaporan(stateTerisi(), { tipe: "reset" }))).toBe(true);
  });
});

describe("drafDariState", () => {
  it("menyimpan isian teks dan hanya nama media, bukan berkasnya", () => {
    const state = reducerFormLaporan(stateTerisi(), {
      tipe: "tambah-media",
      media: [media("a.png"), media("b.png")],
    });
    const draf = drafDariState(state, [], SEKARANG);
    expect(draf).toEqual({
      versi: 1,
      informasi,
      namaMedia: ["a.png", "b.png"],
      disimpanPada: "2026-11-10T03:00:00.000Z",
    });
    expect(JSON.stringify(draf)).not.toContain("berkas");
  });

  it("memakai nama media tertunda selama media belum dipilih ulang", () => {
    expect(drafDariState(stateTerisi(), ["lama.png"], SEKARANG).namaMedia).toEqual(["lama.png"]);
    const dipilihUlang = reducerFormLaporan(stateTerisi(), { tipe: "tambah-media", media: [media("baru.png")] });
    expect(drafDariState(dipilihUlang, ["lama.png"], SEKARANG).namaMedia).toEqual(["baru.png"]);
  });
});

describe("simpan, baca, hapus draf", () => {
  it("draf yang disimpan bisa dibaca kembali utuh", () => {
    const { penyimpanan } = penyimpananPalsu();
    const draf = drafDariState(stateTerisi(), ["a.png"], SEKARANG);
    expect(simpanDraf(KUNCI, draf, penyimpanan)).toBe(true);
    expect(bacaDraf(KUNCI, penyimpanan)).toEqual(draf);
  });

  it("isian dari draf mengembalikan state form yang sama", () => {
    const { penyimpanan } = penyimpananPalsu();
    simpanDraf(KUNCI, drafDariState(stateTerisi(), [], SEKARANG), penyimpanan);
    const draf = bacaDraf(KUNCI, penyimpanan)!;
    const dipulihkan = reducerFormLaporan(buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }), {
      tipe: "informasi",
      perubahan: draf.informasi,
    });
    expect(dipulihkan.informasi).toEqual(stateTerisi().informasi);
    expect(dipulihkan.media).toEqual([]);
  });

  it("tidak ada draf → null", () => {
    expect(bacaDraf(KUNCI, penyimpananPalsu().penyimpanan)).toBeNull();
  });

  it("draf dihapus setelah terkirim", () => {
    const { isi, penyimpanan } = penyimpananPalsu();
    simpanDraf(KUNCI, drafDariState(stateTerisi(), [], SEKARANG), penyimpanan);
    hapusDraf(KUNCI, penyimpanan);
    expect(isi.has(KUNCI)).toBe(false);
    expect(bacaDraf(KUNCI, penyimpanan)).toBeNull();
  });

  it("draf rusak atau bentuknya salah dibuang", () => {
    const salah = [
      "{bukan json",
      JSON.stringify({ versi: 2, informasi, namaMedia: [], disimpanPada: "" }),
      JSON.stringify({ versi: 1, informasi: { ...informasi, sumber: "RAHASIA" }, namaMedia: [], disimpanPada: "" }),
      JSON.stringify({ versi: 1, informasi: { ...informasi, latitude: 200 }, namaMedia: [], disimpanPada: "" }),
      JSON.stringify({ versi: 1, informasi, namaMedia: ["a", "b", "c", "d"], disimpanPada: "" }),
    ];
    for (const teks of salah) {
      const { isi, penyimpanan } = penyimpananPalsu({ [KUNCI]: teks });
      expect(bacaDraf(KUNCI, penyimpanan), teks).toBeNull();
      expect(isi.has(KUNCI), teks).toBe(false);
    }
  });

  it("isian yang belum dipilih (sumber kosong, koordinat null) tetap valid", () => {
    const { penyimpanan } = penyimpananPalsu();
    const sebagian = reducerFormLaporan(buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }), {
      tipe: "informasi",
      perubahan: { judul: "Baru judul" },
    });
    simpanDraf(KUNCI, drafDariState(sebagian, [], SEKARANG), penyimpanan);
    expect(bacaDraf(KUNCI, penyimpanan)?.informasi).toEqual(sebagian.informasi);
  });

  it("penyimpanan tidak tersedia atau penuh tidak melempar error", () => {
    const draf = drafDariState(stateTerisi(), [], SEKARANG);
    expect(simpanDraf(KUNCI, draf, penyimpananRusak)).toBe(false);
    expect(bacaDraf(KUNCI, penyimpananRusak)).toBeNull();
    expect(() => hapusDraf(KUNCI, penyimpananRusak)).not.toThrow();
    expect(simpanDraf(KUNCI, draf, null)).toBe(false);
    expect(bacaDraf(KUNCI, null)).toBeNull();
  });
});

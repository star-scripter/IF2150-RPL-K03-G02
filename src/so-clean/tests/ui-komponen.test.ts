/** Logika komponen UI dasar (FE-02) yang bisa diuji tanpa DOM: Pagination dan Toast. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  daftarHalaman,
  jumlahHalaman,
  rentangItem,
} from "../components/ui/pagination-utils";
import {
  MAKS_TOAST,
  ambilDaftarToast,
  langganan,
  notify,
  resetToast,
  tutupToast,
} from "../components/ui/toast-store";

describe("pagination", () => {
  it("menghitung jumlah halaman dari meta kontrak", () => {
    expect(jumlahHalaman({ limit: 6, total: 12 })).toBe(2);
    expect(jumlahHalaman({ limit: 6, total: 13 })).toBe(3);
    expect(jumlahHalaman({ limit: 6, total: 0 })).toBe(0);
  });

  it("menghitung rentang item yang tampil", () => {
    expect(rentangItem({ page: 1, limit: 6, total: 12 })).toEqual({ dari: 1, sampai: 6 });
    expect(rentangItem({ page: 3, limit: 6, total: 13 })).toEqual({ dari: 13, sampai: 13 });
    expect(rentangItem({ page: 1, limit: 6, total: 0 })).toBeNull();
    // Halaman melewati data (mis. data berkurang setelah verifikasi) → kosong, bukan angka aneh.
    expect(rentangItem({ page: 4, limit: 6, total: 12 })).toBeNull();
  });

  it("menampilkan semua nomor jika halaman sedikit", () => {
    expect(daftarHalaman(1, 2)).toEqual([1, 2]);
    expect(daftarHalaman(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(daftarHalaman(1, 0)).toEqual([]);
  });

  it("memakai elipsis jika halaman banyak", () => {
    expect(daftarHalaman(5, 10)).toEqual([1, "elipsis", 4, 5, 6, "elipsis", 10]);
    expect(daftarHalaman(1, 10)).toEqual([1, 2, "elipsis", 10]);
    expect(daftarHalaman(10, 10)).toEqual([1, "elipsis", 9, 10]);
    expect(daftarHalaman(3, 10)).toEqual([1, 2, 3, 4, "elipsis", 10]);
  });
});

describe("toast (notify)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToast();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("menambah toast dengan jenis yang sesuai", () => {
    notify("Halo");
    notify.sukses("Berhasil");
    notify.gagal("Gagal");
    expect(ambilDaftarToast().map((t) => [t.jenis, t.pesan])).toEqual([
      ["info", "Halo"],
      ["sukses", "Berhasil"],
      ["gagal", "Gagal"],
    ]);
  });

  it("hilang otomatis setelah durasi, kecuali durasi 0", () => {
    notify.info("Sementara", 1000);
    notify("Tetap", { durasi: 0 });
    vi.advanceTimersByTime(1000);
    expect(ambilDaftarToast().map((t) => t.pesan)).toEqual(["Tetap"]);
  });

  it("bisa ditutup manual dan memberi tahu pendengar", () => {
    const dengar = vi.fn();
    const berhenti = langganan(dengar);
    const id = notify("Tutup saya");
    tutupToast(id);
    tutupToast(id); // id yang sudah hilang tidak memicu perubahan lagi
    expect(ambilDaftarToast()).toHaveLength(0);
    expect(dengar).toHaveBeenCalledTimes(2);
    berhenti();
  });

  it(`menyimpan paling banyak ${MAKS_TOAST} toast (yang terlama dibuang)`, () => {
    for (let i = 1; i <= MAKS_TOAST + 2; i++) notify(`Toast ${i}`);
    const pesan = ambilDaftarToast().map((t) => t.pesan);
    expect(pesan).toHaveLength(MAKS_TOAST);
    expect(pesan.at(-1)).toBe(`Toast ${MAKS_TOAST + 2}`);
  });
});

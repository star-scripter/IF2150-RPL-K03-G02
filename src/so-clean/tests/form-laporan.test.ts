import { describe, expect, it } from "vitest";
import {
  buatStateFormLaporan,
  formatWaktuLaporan,
  reducerFormLaporan,
  type AksiFormLaporan,
  type BagianLaporan,
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

function media(idLokal = "foto-1"): MediaFormLaporan {
  return { idLokal, berkas: new File(["foto"], `${idLokal}.png`, { type: "image/png" }), unggahan: null };
}

function alur(state: StateFormLaporan, ...aksi: AksiFormLaporan[]) {
  return aksi.reduce(reducerFormLaporan, state);
}

function formTerisi() {
  return alur(
    buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }),
    { tipe: "informasi", perubahan: informasi },
    { tipe: "lanjut" },
    { tipe: "tambah-media", media: [media()] },
    { tipe: "lanjut" },
  );
}

describe("state form multi-step FE-09", () => {
  it("memulai form kosong di I-11 tanpa data contoh atau koordinat palsu", () => {
    const state = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } });
    expect(state.langkah).toBe(0);
    expect(state.informasi.judul).toBe("");
    expect(state.informasi.latitude).toBeNull();
    expect(state.informasi.longitude).toBeNull();
    expect(state.media).toEqual([]);
  });

  it("mempertahankan semua isian, koordinat, dan File saat I-11 → I-12 → I-13 → I-12 → I-11", () => {
    const tinjauan = formTerisi();
    const berkas = tinjauan.media[0].berkas;
    const kembali = alur(tinjauan, { tipe: "kembali" }, { tipe: "kembali" });
    expect(tinjauan.langkah).toBe(2);
    expect(kembali.langkah).toBe(0);
    expect(kembali.informasi).toEqual(informasi);
    expect(kembali.media[0].berkas).toBe(berkas);
    const majuLagi = alur(kembali, { tipe: "lanjut" }, { tipe: "lanjut" });
    expect(majuLagi.informasi).toEqual(informasi);
    expect(majuLagi.media[0].berkas).toBe(berkas);
  });

  it.each<BagianLaporan>(["judul", "lokasi", "waktu", "sumber", "jenisSampah"])(
    'tombol "Ubah %s" membuka I-11, mempertahankan bagian lain, lalu kembali ke tinjauan',
    (bagian) => {
      const sebelum = formTerisi();
      const mengedit = reducerFormLaporan(sebelum, { tipe: "ubah", bagian });
      expect(mengedit.langkah).toBe(0);
      expect(mengedit.bagianDiedit).toBe(bagian);
      expect(mengedit.informasi).toBe(sebelum.informasi);
      expect(mengedit.media).toBe(sebelum.media);
      const sesudah = reducerFormLaporan(mengedit, { tipe: "lanjut" });
      expect(sesudah.langkah).toBe(2);
      expect(sesudah.bagianDiedit).toBeNull();
      expect(sesudah.informasi).toEqual(informasi);
    },
  );

  it('"Ubah Bukti Media" membuka I-12 dan penghapusan hanya mengenai media yang dituju', () => {
    const sebelum = alur(formTerisi(), { tipe: "tambah-media", media: [media("foto-2")] });
    const sesudah = alur(sebelum,
      { tipe: "ubah", bagian: "media" },
      { tipe: "hapus-media", idLokal: "foto-1" },
      { tipe: "lanjut" },
    );
    expect(reducerFormLaporan(sebelum, { tipe: "ubah", bagian: "media" }).langkah).toBe(1);
    expect(sesudah.langkah).toBe(2);
    expect(sesudah.media.map((item) => item.idLokal)).toEqual(["foto-2"]);
    expect(sesudah.informasi).toBe(sebelum.informasi);
    expect(sebelum.media).toHaveLength(2);
  });

  it("mengubah alamat tanpa menimpa waktu, sumber, koordinat, dan bukti", () => {
    const sebelum = formTerisi();
    const sesudah = alur(sebelum,
      { tipe: "ubah", bagian: "lokasi" },
      { tipe: "informasi", perubahan: { lokasi: "Dekat jembatan Cikapundung" } },
      { tipe: "lanjut" },
    );
    expect(sesudah.informasi).toEqual({ ...informasi, lokasi: "Dekat jembatan Cikapundung" });
    expect(sesudah.media).toBe(sebelum.media);
    expect(sebelum.informasi.lokasi).toBe(informasi.lokasi);
  });

  it("kembali dari mode Ubah menuju tinjauan tanpa menghapus perubahan", () => {
    const sesudah = alur(formTerisi(),
      { tipe: "ubah", bagian: "waktu" },
      { tipe: "informasi", perubahan: { waktu: "2026-11-08T15:00" } },
      { tipe: "kembali" },
    );
    expect(sesudah.langkah).toBe(2);
    expect(sesudah.informasi.waktu).toBe("2026-11-08T15:00");
    expect(sesudah.media).toHaveLength(1);
  });

  it("respons upload yang tiba setelah pindah langkah tetap melekat pada file yang benar", () => {
    const sebelum = formTerisi();
    const unggahan = { idMedia: 41, url: "/media/41", tipe: "FOTO" as const };
    const sesudah = reducerFormLaporan(sebelum, { tipe: "media-terunggah", idLokal: "foto-1", unggahan });
    expect(sesudah.langkah).toBe(2);
    expect(sesudah.media[0].unggahan).toEqual(unggahan);
    expect(sesudah.media[0].berkas).toBe(sebelum.media[0].berkas);
    // Respons upload terlambat setelah pengguna menghapus berkas tidak menambahkannya kembali.
    const dihapus = reducerFormLaporan(sesudah, { tipe: "hapus-media", idLokal: "foto-1" });
    expect(reducerFormLaporan(dihapus, { tipe: "media-terunggah", idLokal: "foto-1", unggahan }).media).toEqual([]);
  });

  it("menjaga batas 3 media dan identitas media yang unik meskipun ada beberapa aksi berurutan", () => {
    const sesudah = alur(formTerisi(),
      { tipe: "tambah-media", media: [media("foto-1"), media("foto-2"), media("foto-2")] },
      { tipe: "tambah-media", media: [media("foto-3"), media("foto-4")] },
    );
    expect(sesudah.media.map((item) => item.idLokal)).toEqual(["foto-1", "foto-2", "foto-3"]);
  });

  it("tidak mengizinkan langkah keluar dari rentang I-11–I-13", () => {
    const awal = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } });
    expect(alur(awal, { tipe: "kembali" }, { tipe: "kembali" }).langkah).toBe(0);
    expect(alur(formTerisi(), { tipe: "lanjut" }, { tipe: "lanjut" }).langkah).toBe(2);
  });

  it("state setiap form terisolasi dan reset hanya terjadi melalui aksi eksplisit", () => {
    const formA = formTerisi();
    const formB = buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } });
    expect(formB.informasi.judul).toBe("");
    expect(formB.media).toEqual([]);
    const reset = reducerFormLaporan(formA, { tipe: "reset" });
    expect(reset).toEqual(formB);
    expect(formA.informasi).toEqual(informasi);
    expect(formA.media).toHaveLength(1);
  });

  it("menerima data awal untuk integrasi dan mendukung CleanIt tanpa membuat route/API baru", () => {
    const konfigurasi = { jenis: "CLEANIT" as const, lokasiId: 5, namaLokasi: "Pantai Ancol" };
    const awal = buatStateFormLaporan({ konfigurasi, informasi: { waktu: informasi.waktu } });
    expect(awal.informasi.judul).toBe("Pembersihan Pantai Ancol");
    const sesudah = alur(awal,
      { tipe: "informasi", perubahan: { judul: "Ancol sudah dibersihkan" } },
      { tipe: "lanjut" },
      { tipe: "tambah-media", media: [media()] },
      { tipe: "lanjut" },
      { tipe: "ubah", bagian: "judul" },
      { tipe: "lanjut" },
    );
    expect(sesudah.konfigurasi).toEqual(konfigurasi);
    expect(sesudah.informasi.judul).toBe("Ancol sudah dibersihkan");
    expect(sesudah.informasi.waktu).toBe(informasi.waktu);
    expect(reducerFormLaporan(sesudah, { tipe: "reset" }).informasi.judul).toBe("Pembersihan Pantai Ancol");
  });
});

describe("waktu tinjauan dalam WIB", () => {
  it("menampilkan waktu sesuai isian WIB, termasuk dekat pergantian tanggal", () => {
    expect(formatWaktuLaporan("2026-11-08T00:30")).toBe("8 November 2026 pukul 00.30 WIB");
    expect(formatWaktuLaporan("2026-11-08T23:59")).toBe("8 November 2026 pukul 23.59 WIB");
  });
  it("menangani nilai kosong dan tidak valid tanpa melempar error", () => {
    expect(formatWaktuLaporan("")).toBe("Belum diisi");
    expect(formatWaktuLaporan("bukan tanggal")).toBe("Waktu tidak valid");
  });
});

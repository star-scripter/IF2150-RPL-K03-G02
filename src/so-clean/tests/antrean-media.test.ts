import { describe, expect, it, vi } from "vitest";
import { AntreanMedia } from "../lib/antrean-media";
import { ApiError } from "../lib/api/client";
import { buatStateFormLaporan, reducerFormLaporan, type MediaFormLaporan } from "../lib/form-laporan";
import type { ProgresUnggah } from "../lib/api/upload-progress";
import type { MediaUploadResponse } from "../types/api";

const file = new File(["data"], "bukti.png", { type: "image/png" });
const item = (id: string): MediaFormLaporan => ({ idLokal: id, berkas: file, unggahan: null });
const hasil = (idMedia = 1): MediaUploadResponse => ({ idMedia, url: `https://media.example.test/${idMedia}`, tipe: "FOTO" });
async function flush() { for (let i = 0; i < 10; i++) await Promise.resolve(); }
function setup(media = [item("a")]) {
  let state = reducerFormLaporan(buatStateFormLaporan({ konfigurasi: { jenis: "REPORTIT" } }), { tipe: "tambah-media", media });
  const pekerjaan: { signal: AbortSignal; progres: (p: ProgresUnggah) => void; selesai: (h: MediaUploadResponse) => void; gagal: (e: unknown) => void }[] = [];
  const berhasil = vi.fn((idLokal: string, unggahan: MediaUploadResponse) => { state = reducerFormLaporan(state, { tipe: "media-terunggah", idLokal, unggahan }); });
  const gagal = vi.fn();
  const unggah = vi.fn((_file: File, opsi: { signal: AbortSignal; onUploadProgress: (p: ProgresUnggah) => void }) => new Promise<MediaUploadResponse>((resolve, reject) => {
    pekerjaan.push({ signal: opsi.signal, progres: opsi.onUploadProgress, selesai: resolve, gagal: reject });
  }));
  const antrean = new AntreanMedia({ unggah, berhasil, gagal }); antrean.sinkronkan(state.media);
  return { antrean, unggah, berhasil, gagal, pekerjaan, state: () => state };
}

describe("antrean media FE-11", () => {
  it("menyimpan file di memori offline, lalu mengunggah otomatis saat online", async () => {
    const h = setup(); h.antrean.aktifkan(false); await flush();
    expect(h.unggah).not.toHaveBeenCalled(); expect(h.antrean.ambilSnapshot().a.status).toBe("menunggu");
    h.antrean.setOnline(true); await flush(); expect(h.unggah).toHaveBeenCalledOnce();
    expect(h.unggah.mock.calls[0][0]).toBe(file);
  });
  it("hanya satu unggahan aktif per id, dengan antrean serial", async () => {
    const h = setup([item("a"), item("b")]); h.antrean.aktifkan(true);
    h.antrean.setOnline(true); h.antrean.sinkronkan(h.state().media); await flush();
    expect(h.unggah).toHaveBeenCalledOnce();
    h.pekerjaan[0].selesai(hasil(10)); await flush(); expect(h.unggah).toHaveBeenCalledTimes(2);
    expect(h.state().media[0].unggahan?.idMedia).toBe(10);
  });
  it("progres 100% belum berarti berhasil sebelum respons berisi ID", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush();
    h.pekerjaan[0].progres({ loaded: 20, total: 100 }); expect(h.antrean.ambilSnapshot().a).toEqual({ status: "mengunggah", persen: 20 });
    h.pekerjaan[0].progres({ loaded: 100, total: 100 }); expect(h.berhasil).not.toHaveBeenCalled();
    expect(h.antrean.ambilSnapshot().a.status).toBe("mengunggah");
    h.pekerjaan[0].selesai(hasil()); await flush(); expect(h.berhasil).toHaveBeenCalledWith("a", hasil());
  });
  it("total byte tidak diketahui tidak menghasilkan persen palsu", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.pekerjaan[0].progres({ loaded: 5, total: null });
    expect(h.antrean.ambilSnapshot().a).toEqual({ status: "mengunggah", persen: null });
  });
  it("tidak mengunggah ulang file berhasil ketika kembali ke I-12 atau online lagi", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.pekerjaan[0].selesai(hasil()); await flush();
    h.antrean.sinkronkan(h.state().media); h.antrean.setOnline(false); h.antrean.setOnline(true); await flush();
    expect(h.unggah).toHaveBeenCalledOnce(); expect(h.state().media[0].unggahan).toEqual(hasil());
  });
  it("menghapus file aktif membatalkan request dan mengabaikan respons terlambat", async () => {
    const h = setup([item("a"), item("b")]); h.antrean.aktifkan(true); await flush();
    h.antrean.hapus("a"); expect(h.pekerjaan[0].signal.aborted).toBe(true);
    h.pekerjaan[0].selesai(hasil()); await flush();
    expect(h.berhasil).not.toHaveBeenCalled(); expect(h.antrean.ambilSnapshot().a).toBeUndefined();
    expect(h.unggah).toHaveBeenCalledTimes(2);
  });
  it("offline di tengah upload mengantrekan ulang, tanpa menerima progres/hasil lama", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush();
    h.antrean.setOnline(false); h.pekerjaan[0].progres({ loaded: 100, total: 100 }); h.pekerjaan[0].selesai(hasil(9)); await flush();
    expect(h.berhasil).not.toHaveBeenCalled(); expect(h.antrean.ambilSnapshot().a.status).toBe("menunggu");
    h.antrean.setOnline(true); await flush(); expect(h.unggah).toHaveBeenCalledTimes(2);
    h.pekerjaan[1].selesai(hasil(10)); await flush(); expect(h.state().media[0].unggahan?.idMedia).toBe(10);
  });
  it("gagal jaringan dapat dicoba lagi tanpa menghapus unggahan lain", async () => {
    const h = setup([item("a"), item("b")]); h.antrean.aktifkan(true); await flush(); h.pekerjaan[0].selesai(hasil(1)); await flush();
    h.pekerjaan[1].gagal(new ApiError("JARINGAN", 0)); await flush();
    expect(h.antrean.ambilSnapshot().b).toMatchObject({ status: "gagal", bisaUlang: true });
    h.antrean.cobaLagi("b"); await flush(); h.pekerjaan[2].selesai(hasil(2)); await flush();
    expect(h.state().media.map((m) => m.unggahan?.idMedia)).toEqual([1, 2]); expect(h.gagal).toHaveBeenCalledOnce();
  });
  it("error jaringan yang tiba sebelum event offline tetap dilanjutkan otomatis", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush();
    h.pekerjaan[0].gagal(new ApiError("JARINGAN", 0)); await flush();
    expect(h.antrean.ambilSnapshot().a.status).toBe("gagal");
    h.antrean.setOnline(false); expect(h.antrean.ambilSnapshot().a.status).toBe("menunggu");
    h.antrean.setOnline(true); await flush(); h.pekerjaan[1].selesai(hasil(2)); await flush();
    expect(h.state().media[0].unggahan?.idMedia).toBe(2);
  });
  it.each([[409, "MEDIA_SUDAH_DIGUNAKAN"], [413, "FILE_TERLALU_BESAR"], [415, "TIPE_FILE_TIDAK_DIDUKUNG"]] as const)("error %i meminta penggantian file", async (status, code) => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.pekerjaan[0].gagal(new ApiError(code, status)); await flush();
    expect(h.antrean.ambilSnapshot().a).toMatchObject({ status: "gagal", bisaUlang: false });
    h.antrean.cobaLagi("a"); h.antrean.setOnline(true); await flush(); expect(h.unggah).toHaveBeenCalledOnce();
  });
  it("reset draf membatalkan file yang dikeluarkan dari state FE-09", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.antrean.sinkronkan([]);
    expect(h.pekerjaan[0].signal.aborted).toBe(true); h.pekerjaan[0].selesai(hasil()); await flush(); expect(h.berhasil).not.toHaveBeenCalled();
  });
  it("lifecycle StrictMode/unmount tidak menyimpan hasil request yang dibatalkan", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.antrean.nonaktifkan(); h.antrean.aktifkan(true); await flush();
    expect(h.pekerjaan[0].signal.aborted).toBe(true); h.pekerjaan[0].selesai(hasil(1)); h.pekerjaan[1].selesai(hasil(2)); await flush();
    expect(h.berhasil).toHaveBeenCalledTimes(1); expect(h.state().media[0].unggahan?.idMedia).toBe(2);
  });
  it("menolak respons sukses yang tidak berisi ID valid", async () => {
    const h = setup(); h.antrean.aktifkan(true); await flush(); h.pekerjaan[0].selesai({ ...hasil(), idMedia: 0 }); await flush();
    expect(h.berhasil).not.toHaveBeenCalled(); expect(h.antrean.ambilSnapshot().a.status).toBe("gagal");
  });
});

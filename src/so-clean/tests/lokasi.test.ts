import { afterEach, describe, expect, it, vi } from "vitest";
import { ambilPosisiPengguna, bacaDaftarLokasi, formatDilaporkan, formatJarakLokasi, jarakHaversineKm, LABEL_SAMPAH_LOKASI, urutkanLokasi } from "@/lib/lokasi";
import { LOKASI_UJI_FE14, POSISI_UJI_FE14 } from "./helpers/lokasi-fe14";

afterEach(() => vi.useRealTimers());
describe("Haversine dan urutan FE-14", () => {
  it("menghitung jarak yang diketahui dalam kilometer dan bersifat simetris", () => {
    const a = { latitude: 0, longitude: 0 }, b = { latitude: 0, longitude: 1 };
    expect(jarakHaversineKm(a, b)).toBeCloseTo(111.195, 3);
    expect(jarakHaversineKm(a, a)).toBe(0);
    expect(jarakHaversineKm(a, b)).toBe(jarakHaversineKm(b, a));
  });
  it("menangani antipode dan lintas batas bujur tanpa NaN", () => {
    expect(jarakHaversineKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 })).toBeCloseTo(20015.087, 3);
    expect(jarakHaversineKm({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 })).toBeCloseTo(22.239, 3);
    expect(jarakHaversineKm({ latitude: NaN, longitude: 0 }, POSISI_UJI_FE14)).toBeNull();
  });
  it("mengurutkan semua lokasi menurut jarak tanpa memutasi sumber atau memfilter radius", () => {
    const urut = urutkanLokasi(LOKASI_UJI_FE14, "terdekat", POSISI_UJI_FE14);
    expect(urut.map((item) => item.idLokasi)).toEqual([32, 31, 33]);
    expect(urut[0].jarakKm).toBeCloseTo(0.111195, 5);
    expect(urut[2].jarakKm).toBeGreaterThan(100);
    expect(LOKASI_UJI_FE14.map((item) => item.idLokasi)).toEqual([31, 32, 33]);
    expect(LOKASI_UJI_FE14[0]).not.toHaveProperty("jarakKm");
  });
  it("menggunakan dilaporkanAt menurun saat Terbaru atau GPS tidak tersedia", () => {
    const dibalik = [...LOKASI_UJI_FE14].reverse();
    expect(urutkanLokasi(dibalik, "terbaru", POSISI_UJI_FE14).map((item) => item.idLokasi)).toEqual([31, 32, 33]);
    const tanpaGps = urutkanLokasi(dibalik, "terdekat", null);
    expect(tanpaGps.map((item) => item.idLokasi)).toEqual([31, 32, 33]);
    expect(tanpaGps.every((item) => item.jarakKm === null)).toBe(true);
  });
  it("memakai waktu lalu ID menurun sebagai pemecah seri yang stabil", () => {
    const sama = LOKASI_UJI_FE14.map((item) => ({ ...item, latitude: -6.885, longitude: 107.6065, dilaporkanAt: LOKASI_UJI_FE14[0].dilaporkanAt }));
    expect(urutkanLokasi(sama, "terdekat", POSISI_UJI_FE14).map((item) => item.idLokasi)).toEqual([33, 32, 31]);
  });
});

describe("kontrak dan label kartu I-09", () => {
  it("menerima data BE-17 dan respons kosong yang sah", () => {
    expect(bacaDaftarLokasi(LOKASI_UJI_FE14)).toEqual(LOKASI_UJI_FE14);
    expect(bacaDaftarLokasi([])).toEqual([]);
    expect(Object.keys(LABEL_SAMPAH_LOKASI)).toHaveLength(5);
  });
  it.each([null, {}, [{ ...LOKASI_UJI_FE14[0], latitude: 91 }], [{ ...LOKASI_UJI_FE14[0], poin: 30 }], [{ ...LOKASI_UJI_FE14[0], status: "DIBERSIHKAN" }], [{ ...LOKASI_UJI_FE14[0], dilaporkanAt: "rusak" }], [LOKASI_UJI_FE14[0], LOKASI_UJI_FE14[0]]])("menolak respons rusak sebagai error, bukan daftar kosong: %j", (value) => {
    expect(() => bacaDaftarLokasi(value)).toThrow();
  });
  it("memformat meter, kilometer, dan bilangan Indonesia", () => {
    expect(formatJarakLokasi(0)).toBe("0 m"); expect(formatJarakLokasi(0.125)).toBe("125 m"); expect(formatJarakLokasi(1.23)).toBe("1,2 km");
  });
  it("menampilkan waktu relatif dan tanggal dengan zona WIB", () => {
    const sekarang = Date.parse("2026-11-12T03:00:00Z");
    expect(formatDilaporkan("2026-11-12T03:01:00Z", sekarang)).toBe("baru saja");
    expect(formatDilaporkan("2026-11-12T02:45:00Z", sekarang)).toBe("15 menit lalu");
    expect(formatDilaporkan("2026-11-12T01:00:00Z", sekarang)).toBe("2 jam lalu");
    expect(formatDilaporkan("2026-11-11T01:00:00Z", sekarang)).toBe("kemarin");
    expect(formatDilaporkan("2026-11-09T01:00:00Z", sekarang)).toBe("3 hari lalu");
    expect(formatDilaporkan("2026-11-01T18:00:00Z", sekarang)).toBe("2 Nov 2026");
  });
});

type CallbackSukses = Parameters<Geolocation["getCurrentPosition"]>[0];
type CallbackGagal = NonNullable<Parameters<Geolocation["getCurrentPosition"]>[1]>;
function geolocationUji() {
  let sukses!: CallbackSukses, gagal!: CallbackGagal;
  const getCurrentPosition = vi.fn((a: CallbackSukses, b?: CallbackGagal | null) => { sukses = a; gagal = b!; });
  return { api: { getCurrentPosition }, berhasil: (latitude = -6.886) => sukses({ coords: { latitude, longitude: 107.6065 } } as GeolocationPosition), gagal: (code: number) => gagal({ code } as GeolocationPositionError) };
}
describe("GPS dan fallback", () => {
  it("mengambil posisi dengan timeout dan tidak memerlukan akses API lokasi", async () => {
    const gps = geolocationUji(); const tugas = ambilPosisiPengguna(gps.api, new AbortController().signal);
    gps.berhasil(); await expect(tugas).resolves.toEqual(POSISI_UJI_FE14);
    expect(gps.api.getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  });
  it.each([[1, "Izin lokasi ditolak"], [2, "belum tersedia"], [3, "terlalu lama"]])("memberi pesan fallback GPS kode %i", async (code, pesan) => {
    const gps = geolocationUji(); const tugas = ambilPosisiPengguna(gps.api, new AbortController().signal); gps.gagal(code);
    await expect(tugas).rejects.toThrow(pesan);
  });
  it("membatasi waktu tunggu meskipun browser tidak memanggil callback", async () => {
    vi.useFakeTimers(); const gps = geolocationUji(); const tugas = ambilPosisiPengguna(gps.api, new AbortController().signal);
    const periksa = expect(tugas).rejects.toThrow("terlalu lama"); await vi.advanceTimersByTimeAsync(12000); await periksa;
    gps.berhasil(); expect(vi.getTimerCount()).toBe(0);
  });
  it("mengabaikan callback terlambat setelah halaman dibatalkan", async () => {
    vi.useFakeTimers(); const gps = geolocationUji(), pengendali = new AbortController(); const tugas = ambilPosisiPengguna(gps.api, pengendali.signal);
    pengendali.abort(); gps.berhasil(); gps.gagal(1);
    await expect(tugas).rejects.toMatchObject({ name: "AbortError" }); expect(vi.getTimerCount()).toBe(0);
  });
  it("menolak koordinat GPS rusak", async () => {
    const gps = geolocationUji(); const tugas = ambilPosisiPengguna(gps.api, new AbortController().signal); gps.berhasil(NaN);
    await expect(tugas).rejects.toThrow("Koordinat perangkat belum tersedia");
  });
  it("fallback saat GPS tidak didukung, halaman tidak aman, atau API melempar", async () => {
    await expect(ambilPosisiPengguna(undefined, new AbortController().signal)).rejects.toThrow("belum mendukung");
    const gps = geolocationUji(); await expect(ambilPosisiPengguna(gps.api, new AbortController().signal, false)).rejects.toThrow("HTTPS");
    expect(gps.api.getCurrentPosition).not.toHaveBeenCalled();
    await expect(ambilPosisiPengguna({ getCurrentPosition: () => { throw new Error("ditolak browser"); } }, new AbortController().signal)).rejects.toThrow("belum tersedia");
  });
});

/** FE-14 / C07: data lokasi BE-17, jarak, urutan, dan posisi pengguna. */
import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type { JenisSampah, Lokasi } from "@/types/api";

export type PosisiPengguna = { latitude: number; longitude: number };
export type UrutanLokasi = "terdekat" | "terbaru";
export type LokasiBerjarak = Lokasi & { jarakKm: number | null };

export const LABEL_SAMPAH_LOKASI: Record<JenisSampah, string> = {
  PLASTIK: "Sampah plastik",
  KEMASAN_STYROFOAM: "Sampah kemasan dan styrofoam",
  RUMAH_TANGGA: "Sampah rumah tangga",
  ORGANIK: "Sampah organik",
  LAINNYA: "Sampah lainnya",
};

const daftarSchema = z.array(z.object({
  idLokasi: z.number().int().min(1).max(2_147_483_647),
  nama: z.string().trim().min(1).max(255),
  alamat: z.string().max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  jenisSampah: z.enum(["PLASTIK", "KEMASAN_STYROFOAM", "RUMAH_TANGGA", "ORGANIK", "LAINNYA"]),
  status: z.literal("TERCEMAR"),
  poin: z.union([z.literal(50), z.literal(100), z.literal(200)]),
  dilaporkanAt: z.iso.datetime({ offset: true }),
})).refine((daftar) => new Set(daftar.map((lokasi) => lokasi.idLokasi)).size === daftar.length);

/** Respons rusak menjadi error yang bisa dicoba lagi, bukan empty state atau render gagal. */
export function bacaDaftarLokasi(value: unknown): Lokasi[] {
  const hasil = daftarSchema.safeParse(value);
  if (!hasil.success) throw new ApiError("INTERNAL_ERROR", 200);
  return hasil.data;
}

export function posisiValid(posisi: PosisiPengguna): boolean {
  return Number.isFinite(posisi.latitude) && Math.abs(posisi.latitude) <= 90
    && Number.isFinite(posisi.longitude) && Math.abs(posisi.longitude) <= 180;
}

/** Haversine jarak garis lurus; posisi hanya dipakai di client, tanpa filter radius. */
export function jarakHaversineKm(dari: PosisiPengguna, ke: PosisiPengguna): number | null {
  if (!posisiValid(dari) || !posisiValid(ke)) return null;
  const radian = (derajat: number) => derajat * Math.PI / 180;
  const a = Math.sin(radian(ke.latitude - dari.latitude) / 2) ** 2
    + Math.cos(radian(dari.latitude)) * Math.cos(radian(ke.latitude))
    * Math.sin(radian(ke.longitude - dari.longitude) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export function urutkanLokasi(daftar: readonly Lokasi[], urutan: UrutanLokasi, posisi: PosisiPengguna | null): LokasiBerjarak[] {
  const hasil = daftar.map((lokasi) => ({ ...lokasi, jarakKm: posisi ? jarakHaversineKm(posisi, lokasi) : null }));
  return hasil.sort((a, b) => {
    if (urutan === "terdekat" && a.jarakKm !== null && b.jarakKm !== null && a.jarakKm !== b.jarakKm) return a.jarakKm - b.jarakKm;
    return Date.parse(b.dilaporkanAt) - Date.parse(a.dilaporkanAt) || b.idLokasi - a.idLokasi;
  });
}

export function formatJarakLokasi(jarakKm: number): string {
  return jarakKm < 1
    ? `${Math.round(jarakKm * 1000).toLocaleString("id-ID")} m`
    : `${jarakKm.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const HARI = 86_400_000;
export function formatDilaporkan(iso: string, sekarang: number): string {
  const waktu = Date.parse(iso), selisih = Math.max(0, sekarang - waktu);
  if (!Number.isFinite(waktu)) return "Waktu belum tersedia";
  if (selisih < 60_000) return "baru saja";
  if (selisih < 3_600_000) return `${Math.floor(selisih / 60_000)} menit lalu`;
  if (selisih < HARI) return `${Math.floor(selisih / 3_600_000)} jam lalu`;
  const bedaHariWib = Math.floor((sekarang + 25_200_000) / HARI) - Math.floor((waktu + 25_200_000) / HARI);
  if (bedaHariWib === 1) return "kemarin";
  if (selisih < 7 * HARI) return `${Math.floor(selisih / HARI)} hari lalu`;
  return FORMAT_TANGGAL.format(new Date(waktu));
}

/** Promise GPS dapat dibatalkan; callback lama tidak mengubah halaman setelah unmount/retry. */
export function ambilPosisiPengguna(
  geolocation: Pick<Geolocation, "getCurrentPosition"> | undefined,
  signal: AbortSignal,
  aman = true,
): Promise<PosisiPengguna> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Dibatalkan", "AbortError")); return; }
    if (!aman) { reject(new Error("Lokasi perangkat memerlukan HTTPS atau localhost.")); return; }
    if (!geolocation) { reject(new Error("Browser ini belum mendukung lokasi perangkat.")); return; }
    let selesai = false;
    const timer = setTimeout(() => gagal("Pencarian lokasi terlalu lama. Anda dapat mencoba GPS lagi."), 12_000);
    function rapikan() { clearTimeout(timer); signal.removeEventListener("abort", batal); selesai = true; }
    function gagal(pesan: string) { if (!selesai) { rapikan(); reject(new Error(pesan)); } }
    function batal() { if (!selesai) { rapikan(); reject(new DOMException("Dibatalkan", "AbortError")); } }
    signal.addEventListener("abort", batal, { once: true });
    try {
      geolocation.getCurrentPosition((hasil) => {
        if (selesai) return;
        const posisi = { latitude: hasil.coords.latitude, longitude: hasil.coords.longitude };
        if (!posisiValid(posisi)) { gagal("Koordinat perangkat belum tersedia. Anda dapat mencoba GPS lagi."); return; }
        rapikan(); resolve(posisi);
      }, (error) => gagal(error.code === 1
        ? "Izin lokasi ditolak. Izinkan lokasi di browser untuk melihat jarak."
        : error.code === 3 ? "Pencarian lokasi terlalu lama. Anda dapat mencoba GPS lagi."
          : "Lokasi perangkat belum tersedia. Anda dapat mencoba GPS lagi."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 });
    } catch { gagal("Lokasi perangkat belum tersedia. Anda dapat mencoba GPS lagi."); }
  });
}

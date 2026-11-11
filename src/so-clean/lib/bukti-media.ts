import { ApiError } from "@/lib/api/client";
import { MAKS_MEDIA_LAPORAN, MAKS_UKURAN_MEDIA, type MediaFormLaporan } from "@/lib/form-laporan";
import type { MediaUploadResponse } from "@/types/api";

export const TIPE_BUKTI_MEDIA = ["image/jpeg", "image/png", "video/mp4"] as const;

export function validasiPilihanMedia(berkas: readonly File[], jumlahTerpilih: number): string | null {
  if (jumlahTerpilih + berkas.length > MAKS_MEDIA_LAPORAN) return "Maksimal 3 media. Hapus salah satu media sebelum menambahkan yang baru.";
  if (berkas.some((file) => !TIPE_BUKTI_MEDIA.includes(file.type as typeof TIPE_BUKTI_MEDIA[number]))) return "Pilih foto JPG/PNG atau video MP4.";
  if (berkas.some((file) => file.size === 0)) return "File tidak boleh kosong. Pilih foto atau video yang berisi data.";
  if (berkas.some((file) => file.size > MAKS_UKURAN_MEDIA)) return "Ukuran file melebihi 20 MB per media.";
  return null;
}

export function hasilUnggahValid(hasil: unknown, berkas?: File): hasil is MediaUploadResponse {
  if (!hasil || typeof hasil !== "object") return false;
  const data = hasil as Partial<MediaUploadResponse>;
  return Number.isSafeInteger(data.idMedia) && Number(data.idMedia) > 0
    && typeof data.url === "string" && /^(https?:|blob:|data:image\/)/.test(data.url)
    && (data.tipe === "FOTO" || data.tipe === "VIDEO")
    && (!berkas || data.tipe === (berkas.type === "video/mp4" ? "VIDEO" : "FOTO"));
}

export function mediaSiapDikirim(media: readonly MediaFormLaporan[]): boolean {
  return media.length > 0 && media.length <= MAKS_MEDIA_LAPORAN
    && media.every((item) => hasilUnggahValid(item.unggahan, item.berkas))
    && new Set(media.map((item) => item.unggahan?.idMedia)).size === media.length;
}

export function isKuotaPenuh(error: unknown): boolean {
  return error instanceof Error && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
}

/** N15: periksa kuota situs yang diketahui, bukan menebak sisa ruang seluruh perangkat. */
export async function periksaKuotaMedia(ukuranBaru: number): Promise<void> {
  try {
    const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
    if (!storage?.estimate) return;
    const { quota, usage } = await storage.estimate();
    if (typeof quota === "number" && Number.isFinite(quota) && quota >= 0
      && typeof usage === "number" && Number.isFinite(usage) && usage >= 0 && quota - usage < ukuranBaru) {
      throw new DOMException("Kuota situs tidak cukup untuk media yang dipilih.", "QuotaExceededError");
    }
  } catch (error) {
    // API estimate dapat ditolak oleh browser; hanya kesalahan kuota yang menahan pemilihan.
    if (isKuotaPenuh(error)) throw error;
  }
}

export function pesanGagalMedia(error: unknown): string {
  if (isKuotaPenuh(error)) return "Ruang penyimpanan lokal tidak cukup. Kosongkan ruang atau pilih media yang lebih kecil.";
  return error instanceof ApiError ? error.message : "Media gagal disiapkan. Pilih ulang foto atau video Anda.";
}

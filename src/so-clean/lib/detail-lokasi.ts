/** FE-16 / C14: validasi detail BE-17 dan tujuan navigasi CleanIt. */
import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type { LokasiDetail } from "@/types/api";

const idSchema = z.number().int().min(1).max(2_147_483_647);
const waktuSchema = z.iso.datetime({ offset: true });
const detailSchema = z.object({
  idLokasi: idSchema,
  nama: z.string().trim().min(1).max(255),
  alamat: z.string().max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  jenisSampah: z.enum(["PLASTIK", "KEMASAN_STYROFOAM", "RUMAH_TANGGA", "ORGANIK", "LAINNYA"]),
  status: z.enum(["TERCEMAR", "DIBERSIHKAN"]),
  poin: z.union([z.literal(50), z.literal(100), z.literal(200)]),
  dilaporkanAt: waktuSchema,
  laporanAsal: z.object({
    idLaporan: idSchema,
    judul: z.string().trim().min(1).max(80),
    waktu: waktuSchema,
    sumber: z.enum(["PENGAMATAN_PRIBADI", "INFO_WARGA", "MEDIA_SOSIAL", "LAINNYA"]),
    media: z.array(z.object({ idMedia: idSchema, url: z.string(), tipe: z.enum(["FOTO", "VIDEO"]), createdAt: waktuSchema })),
  }),
});

/** Sama dengan batas ID serial BE-17; input URL yang tidak sah tidak dikirim ke API. */
export function bacaIdLokasi(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const hasil = idSchema.safeParse(Number(value));
  return hasil.success ? hasil.data : null;
}

export function bacaDetailLokasi(value: unknown, idDiharapkan: number): LokasiDetail {
  const hasil = detailSchema.safeParse(value);
  if (!hasil.success || hasil.data.idLokasi !== idDiharapkan) throw new ApiError("INTERNAL_ERROR", 200);
  return hasil.data;
}

/** K2: hanya alamat form FE-17, tanpa request klaim atau perubahan status/poin. */
export function urlFormCleanIt(idLokasi: number): string {
  if (!idSchema.safeParse(idLokasi).success) throw new RangeError("ID lokasi tidak valid.");
  return `/cleanit/${idLokasi}`;
}

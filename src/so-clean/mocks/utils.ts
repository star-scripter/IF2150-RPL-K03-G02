/**
 * Helper respons mock, mengikuti bentuk kontrak:
 * sukses `{ data }` / `{ data, meta }`, gagal `{ error: { code, message, fields? } }`.
 */
import { HttpResponse, type DefaultBodyType, type HttpResponseResolver, type PathParams } from "msw";
import type { KodeError, PaginationMeta, Role } from "../types/api";
import { pesanError } from "../lib/api/pesan-error";
import { db, getSesi, type PenggunaMock } from "./db";

/** Semua handler memakai path ini agar cocok di browser maupun di Node (test). */
export const API = "*/api";

/** Status HTTP per kode error, sesuai tabel "Kode error" kontrak. */
export const STATUS_ERROR = {
  DATA_TIDAK_LENGKAP: 400,
  FORMAT_TIDAK_VALID: 400,
  UNAUTHORIZED: 401,
  LOGIN_GAGAL: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  EMAIL_TERDAFTAR: 409,
  SUDAH_DIVERIFIKASI: 409,
  LOKASI_SUDAH_DIBERSIHKAN: 409,
  CLEANIT_SUDAH_MENUNGGU: 409,
  MEDIA_SUDAH_DIGUNAKAN: 409,
  FILE_TERLALU_BESAR: 413,
  TIPE_FILE_TIDAK_DIDUKUNG: 415,
  POIN_TIDAK_CUKUP: 422,
  STOK_HABIS: 422,
  DI_LUAR_WILAYAH: 422,
  INTERNAL_ERROR: 500,
} as const satisfies Record<KodeError, number>;

export function sukses<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status });
}

export function suksesList<T>(data: T[], meta: PaginationMeta) {
  return HttpResponse.json({ data, meta });
}

export function gagal(code: KodeError, fields?: Record<string, string>) {
  return HttpResponse.json(
    { error: { code, message: pesanError(code), ...(fields ? { fields } : {}) } },
    { status: STATUS_ERROR[code] },
  );
}

/** Error validasi yang dilempar di dalam handler, lalu diubah jadi respons oleh `tanganiError`. */
export class GagalMock extends Error {
  constructor(
    readonly code: KodeError,
    readonly fields?: Record<string, string>,
  ) {
    super(code);
  }
}

/**
 * Cek sesi seperti BE-06: tamu → 401, role salah → 403.
 * Tanpa `roles`, cukup sudah login.
 */
export function wajibLogin(roles?: Role[]): PenggunaMock {
  const idPengguna = getSesi();
  const pengguna = idPengguna ? db.pengguna.find((p) => p.id === idPengguna) : undefined;
  if (!pengguna) throw new GagalMock("UNAUTHORIZED");
  if (roles && !roles.includes(pengguna.role)) throw new GagalMock("FORBIDDEN");
  return pengguna;
}

/** Bungkus resolver: `GagalMock` → respons error kontrak, error lain → 500. */
export function tanganiError<Params extends PathParams = PathParams>(
  resolver: HttpResponseResolver<Params, DefaultBodyType>,
): HttpResponseResolver<Params, DefaultBodyType> {
  return async (info) => {
    try {
      return await resolver(info);
    } catch (error) {
      if (error instanceof GagalMock) return gagal(error.code, error.fields);
      console.error("[msw] error tak terduga di handler mock:", error);
      return gagal("INTERNAL_ERROR");
    }
  };
}

/** Baca body JSON; body kosong/rusak → objek kosong (validasi handler yang menolak). */
export async function bacaJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const json: unknown = await request.json();
    return typeof json === "object" && json !== null && !Array.isArray(json)
      ? (json as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function bacaAngka(nilai: string | null, bawaan: number): number {
  if (nilai === null || nilai === "") return bawaan;
  const angka = Number(nilai);
  if (!Number.isInteger(angka) || angka < 1) throw new GagalMock("FORMAT_TIDAK_VALID");
  return angka;
}

export function paginasi<T>(items: T[], page: number, limit: number) {
  const mulai = (page - 1) * limit;
  return {
    data: items.slice(mulai, mulai + limit),
    meta: { page, limit, total: items.length },
  };
}

export function idDariParam(param: string | readonly string[] | undefined): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) throw new GagalMock("NOT_FOUND");
  return id;
}

/** Jarak dua titik dalam meter (haversine), untuk penggabungan lokasi K13. */
export function jarakMeter(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

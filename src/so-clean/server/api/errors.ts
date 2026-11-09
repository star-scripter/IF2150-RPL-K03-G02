import { ZodError } from "zod";
import type { ApiErrorResponse, KodeError } from "@/types/api";

/** Status HTTP untuk seluruh kode error di kontrak API. */
export const STATUS_BY_ERROR_CODE = {
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
} satisfies Record<KodeError, number>;

/** Error terkontrol yang membawa kode dan status sesuai kontrak API. */
export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: KodeError,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = STATUS_BY_ERROR_CODE[code];
  }
}

/** Ubah issue Zod menjadi pesan per field tanpa memasukkan nilai input ke respons. */
export function zodIssuesToFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.map(String).join(".") : "_request";
    if (fields[field] === undefined) fields[field] = issue.message;
  }

  return fields;
}

/** Normalisasi error yang dilempar controller/validator ke bentuk kontrak. */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(
      "FORMAT_TIDAK_VALID",
      "Format input tidak valid.",
      zodIssuesToFields(error),
    );
  }

  return new ApiError("INTERNAL_ERROR", "Terjadi kesalahan internal.");
}

/** Bangun payload error sesuai kontrak tanpa mengekspos detail internal. */
export function toApiErrorPayload(error: ApiError): ApiErrorResponse {
  return {
    error: {
      code: error.code,
      message:
        error.code === "INTERNAL_ERROR" ? "Terjadi kesalahan internal." : error.message,
      ...(error.code !== "INTERNAL_ERROR" && error.fields ? { fields: error.fields } : {}),
    },
  };
}

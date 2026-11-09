import { ZodError, type ZodIssue } from "zod";
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

function pesanZodPublik(issue: ZodIssue): string {
  // Jangan mengembalikan pesan custom mentah: pesan tersebut dapat memuat nilai
  // input atau nama field tak dikenal dari request.
  if (issue.code === "unrecognized_keys") return "Request berisi field yang tidak dikenal.";
  if (issue.code === "invalid_type") return "Tipe data tidak sesuai.";
  if (issue.code === "too_small") return "Nilai terlalu kecil atau belum diisi.";
  if (issue.code === "too_big") return "Nilai melebihi batas.";
  if (issue.code === "invalid_format") return "Format tidak valid.";
  return "Nilai tidak valid.";
}

/** Ubah issue Zod menjadi pesan publik per field tanpa memantulkan nilai input. */
export function zodIssuesToFields(error: ZodError): Record<string, string> {
  const fields = new Map<string, string>();

  for (const issue of error.issues) {
    const field =
      issue.code !== "unrecognized_keys" && issue.path.length > 0
        ? issue.path.map(String).join(".")
        : "_request";
    if (!fields.has(field)) fields.set(field, pesanZodPublik(issue));
  }

  // Object.fromEntries creates own data properties even for names such as
  // `constructor`, `toString`, and `__proto__`.
  return Object.fromEntries(fields);
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

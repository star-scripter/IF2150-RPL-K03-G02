import type {
  ApiErrorResponse,
  ApiListResponse,
  ApiResponse,
  PaginationMeta,
} from "@/types/api";
import { ApiError, toApiErrorPayload } from "./errors";

/** Respons sukses `{ data }`. */
export function apiSuccess<T>(data: T, status = 200): Response {
  const payload: ApiResponse<T> = { data };
  return Response.json(payload, { status });
}

/** Respons sukses list `{ data, meta }`. */
export function apiList<T>(data: T[], meta: PaginationMeta, status = 200): Response {
  const payload: ApiListResponse<T> = { data, meta };
  return Response.json(payload, { status });
}

/** Respons gagal `{ error }` dengan status yang ditetapkan oleh kode kontrak. */
export function apiFailure(error: ApiError): Response {
  const payload: ApiErrorResponse = toApiErrorPayload(error);
  return Response.json(payload, { status: error.status });
}

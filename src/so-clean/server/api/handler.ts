import { logApiRequest } from "./logger";
import {
  ApiError,
  normalizeApiError,
  STATUS_BY_ERROR_CODE,
} from "./errors";
import type { KodeError } from "@/types/api";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { apiFailure } from "./responses";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Read only the allow-listed error code from a returned API envelope for logging. */
async function errorCodeFromResponse(response: Response): Promise<KodeError | undefined> {
  if (response.status < 400 || !response.headers.get("content-type")?.includes("application/json")) {
    return undefined;
  }

  try {
    const payload: unknown = await response.clone().json();
    if (!isRecord(payload) || !isRecord(payload.error)) return undefined;
    const code = payload.error.code;
    if (typeof code !== "string" || !Object.prototype.hasOwnProperty.call(STATUS_BY_ERROR_CODE, code)) {
      return undefined;
    }
    return code as KodeError;
  } catch {
    return undefined;
  }
}

/**
 * Common error boundary and request logger for Route Handlers.
 * Wrap each route's controller call with this helper.
 */
export async function handleApiRequest(
  request: Request,
  /** Static route template, never `request.url` or a dynamic path value. */
  route: string,
  operation: () => Response | Promise<Response>,
): Promise<Response> {
  const startedAt = Date.now();
  let response: Response;
  let errorCode: KodeError | undefined;
  let errorCategory: "application" | "validation" | "internal" | "returned" | undefined;

  try {
    response = await operation();
  } catch (error) {
    // Preserve Next.js control-flow errors (e.g. request-time cookies during build).
    unstable_rethrow(error);
    const apiError = normalizeApiError(error);
    errorCode = apiError.code;
    errorCategory =
      apiError.code === "INTERNAL_ERROR"
        ? "internal"
        : error instanceof ZodError
          ? "validation"
          : error instanceof ApiError
            ? "application"
            : "internal";

    response = apiFailure(apiError);
  }

  if (!errorCode) {
    errorCode = await errorCodeFromResponse(response);
    if (errorCode) errorCategory = "returned";
  }

  logApiRequest({
    method: request.method,
    route,
    status: response.status,
    durationMs: Date.now() - startedAt,
    ...(errorCode ? { errorCode } : {}),
    ...(errorCategory ? { errorCategory } : {}),
  });

  return response;
}

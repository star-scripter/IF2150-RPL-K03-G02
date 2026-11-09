import { logApiRequest } from "./logger";
import { normalizeApiError } from "./errors";
import { apiFailure } from "./responses";

/**
 * Common error boundary and request logger for Route Handlers.
 * Wrap each route's controller call with this helper.
 */
export async function handleApiRequest(
  request: Request,
  operation: () => Response | Promise<Response>,
): Promise<Response> {
  const startedAt = Date.now();
  let response: Response;
  let errorCode: string | undefined;
  let errorName: string | undefined;

  try {
    response = await operation();
  } catch (error) {
    const apiError = normalizeApiError(error);
    errorCode = apiError.code;

    if (apiError.code === "INTERNAL_ERROR") {
      errorName = error instanceof Error ? error.name : typeof error;
    }

    response = apiFailure(apiError);
  }

  logApiRequest({
    method: request.method,
    path: new URL(request.url).pathname,
    status: response.status,
    durationMs: Date.now() - startedAt,
    ...(errorCode ? { errorCode } : {}),
    ...(errorName ? { errorName } : {}),
  });

  return response;
}

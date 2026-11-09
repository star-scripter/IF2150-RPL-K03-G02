import type { KodeError } from "@/types/api";

export type ApiErrorCategory = "application" | "validation" | "internal" | "returned";

type ApiLogRecord = {
  method: string;
  /** Static route template, e.g. `/api/laporan/[id]`; never a raw request URL. */
  route: string;
  status: number;
  durationMs: number;
  errorCode?: KodeError;
  errorCategory?: ApiErrorCategory;
};

/** Structured request logging. Request bodies, headers, cookies and credentials are never logged. */
export function logApiRequest(record: ApiLogRecord): void {
  const level = record.status >= 500 ? "error" : record.status >= 400 ? "warn" : "info";
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event: "api_request",
    ...record,
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

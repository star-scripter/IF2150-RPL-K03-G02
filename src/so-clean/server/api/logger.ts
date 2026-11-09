type ApiLogRecord = {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  errorCode?: string;
  errorName?: string;
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

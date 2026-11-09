import { z } from "zod";
import type { KodeError } from "@/types/api";
import { ApiError, zodIssuesToFields } from "./errors";

export type ValidationErrorCode = Extract<
  KodeError,
  "DATA_TIDAK_LENGKAP" | "FORMAT_TIDAK_VALID"
>;

/** Validasi nilai yang sudah dibaca menggunakan schema Zod. */
export function validateInput<TSchema extends z.ZodType>(
  input: unknown,
  schema: TSchema,
  errorCode: ValidationErrorCode = "FORMAT_TIDAK_VALID",
): z.output<TSchema> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const message =
      errorCode === "DATA_TIDAK_LENGKAP"
        ? "Data wajib belum lengkap."
        : "Format input tidak valid.";
    throw new ApiError(errorCode, message, zodIssuesToFields(parsed.error));
  }

  return parsed.data;
}

/** Baca JSON request dan validasi body; JSON rusak dipetakan ke FORMAT_TIDAK_VALID. */
export async function parseJsonBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  errorCode: ValidationErrorCode = "FORMAT_TIDAK_VALID",
): Promise<z.output<TSchema>> {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    throw new ApiError("FORMAT_TIDAK_VALID", "Body request harus berupa JSON yang valid.", {
      body: "Body request harus berupa JSON yang valid.",
    });
  }

  return validateInput(input, schema, errorCode);
}

/** Parse query string; nilai berulang dikembalikan sebagai array. */
export function parseQuery<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  errorCode: ValidationErrorCode = "FORMAT_TIDAK_VALID",
): z.output<TSchema> {
  const values = new Map<string, string[]>();
  for (const [key, value] of new URL(request.url).searchParams) {
    const list = values.get(key) ?? [];
    list.push(value);
    values.set(key, list);
  }

  const input = Object.fromEntries(
    [...values].map(([key, list]) => [key, list.length === 1 ? list[0] : list]),
  );
  return validateInput(input, schema, errorCode);
}

/** Baca multipart form-data dan validasi field-nya dengan schema Zod. */
export async function parseFormData<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  errorCode: ValidationErrorCode = "FORMAT_TIDAK_VALID",
): Promise<z.output<TSchema>> {
  let input: unknown;

  try {
    input = Object.fromEntries((await request.formData()).entries());
  } catch {
    throw new ApiError("FORMAT_TIDAK_VALID", "Form request tidak valid.", {
      body: "Form request tidak valid.",
    });
  }

  return validateInput(input, schema, errorCode);
}

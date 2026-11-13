import { z } from "zod";
import { ApiError, zodIssuesToFields } from "./errors";

export type ValidationOptions = {
  /** Field yang kosong/hilang menjadi DATA_TIDAK_LENGKAP; type/format tetap FORMAT_TIDAK_VALID. */
  requiredFields?: readonly string[];
};

function nilaiDiPath(input: unknown, path: string): unknown {
  let current = input;
  for (const segment of path.split(".")) {
    if (
      typeof current !== "object" ||
      current === null ||
      !Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function kosong(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function assertBodyAvailable(request: Request): void {
  if (request.bodyUsed || request.body?.locked) {
    // Ini kesalahan pemakaian request di server, bukan input klien yang salah.
    throw new ApiError("INTERNAL_ERROR", "Terjadi kesalahan internal.");
  }
}

/** Cek required field terpisah agar salah tipe tidak salah diklasifikasikan sebagai data kosong. */
function assertRequiredFields(input: unknown, requiredFields: readonly string[]): void {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return;

  const entries = requiredFields
    .filter((field) => kosong(nilaiDiPath(input, field)))
    .map((field) => [field, "Field wajib diisi."] as const);

  if (entries.length > 0) {
    throw new ApiError(
      "DATA_TIDAK_LENGKAP",
      "Data wajib belum lengkap.",
      Object.fromEntries(entries),
    );
  }
}

/** Validasi nilai yang sudah dibaca menggunakan Zod; mendukung refinement asinkron. */
export async function validateInput<TSchema extends z.ZodType>(
  input: unknown,
  schema: TSchema,
  options: ValidationOptions = {},
): Promise<z.output<TSchema>> {
  // Cek hanya field yang dinyatakan required oleh endpoint; Zod menangani type/format.
  assertRequiredFields(input, options.requiredFields ?? []);

  const parsed = await schema.safeParseAsync(input);
  if (!parsed.success) {
    throw new ApiError(
      "FORMAT_TIDAK_VALID",
      "Format input tidak valid.",
      zodIssuesToFields(parsed.error),
    );
  }

  return parsed.data;
}

/** Baca JSON request dan validasi body; JSON rusak dipetakan ke FORMAT_TIDAK_VALID. */
export async function parseJsonBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  options: ValidationOptions = {},
): Promise<z.output<TSchema>> {
  assertBodyAvailable(request);
  let input: unknown;

  try {
    input = await request.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new ApiError("FORMAT_TIDAK_VALID", "Body request harus berupa JSON yang valid.", {
      body: "Body request harus berupa JSON yang valid.",
    });
  }

  return validateInput(input, schema, options);
}

/** Parse query string; nilai berulang dikembalikan sebagai array. */
export async function parseQuery<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  options: ValidationOptions = {},
): Promise<z.output<TSchema>> {
  const values = new Map<string, string[]>();
  for (const [key, value] of new URL(request.url).searchParams) {
    const list = values.get(key) ?? [];
    list.push(value);
    values.set(key, list);
  }

  const input = Object.fromEntries(
    [...values].map(([key, list]) => [key, list.length === 1 ? list[0] : list]),
  );
  return validateInput(input, schema, options);
}

/** Baca multipart form-data dan validasi field-nya dengan schema Zod. */
function formDataToInput(formData: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const values = new Map<string, FormDataEntryValue[]>();
  for (const [key, value] of formData.entries()) {
    const entries = values.get(key) ?? [];
    entries.push(value);
    values.set(key, entries);
  }

  return Object.fromEntries(
    [...values].map(([key, entries]) => [key, entries.length === 1 ? entries[0] : entries]),
  );
}

export async function parseFormData<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  options: ValidationOptions = {},
): Promise<z.output<TSchema>> {
  assertBodyAvailable(request);
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (contentType !== "multipart/form-data") {
    throw new ApiError("FORMAT_TIDAK_VALID", "Request harus menggunakan multipart/form-data.", {
      body: "Request harus menggunakan multipart/form-data.",
    });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    if (!(error instanceof TypeError) && !(error instanceof SyntaxError)) throw error;
    throw new ApiError("FORMAT_TIDAK_VALID", "Form request tidak valid.", {
      body: "Form request tidak valid.",
    });
  }

  // Field berulang menjadi array agar schema field tunggal menolaknya, bukan
  // diam-diam memakai part terakhir seperti Object.fromEntries langsung.
  const input = formDataToInput(formData);
  return validateInput(input, schema, options);
}

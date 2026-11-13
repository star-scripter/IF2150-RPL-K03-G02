/**
 * API client FE (FE-04).
 *
 * Satu pintu untuk semua pemanggilan `/api/...` dari view. Wrapper ini:
 * - mengirim cookie session (`credentials: "same-origin"`),
 * - mengirim body JSON, atau `FormData` apa adanya untuk upload,
 * - membuka `{ data }` / `{ data, meta }` saat sukses,
 * - mengubah `{ error }`, error jaringan, dan respons yang tidak sesuai kontrak menjadi `ApiError`.
 *
 * Contoh:
 *   const me = await api.get<MeResponse>("/api/me");
 *   try { await api.post("/api/auth/login", body); }
 *   catch (e) { if (e instanceof ApiError) tampilkan(e.message, e.fields); }
 *
 * Untuk pemanggilan per endpoint yang sudah bertipe, pakai `lib/api/endpoints.ts`.
 */
import type { KodeError, PaginationMeta } from "../../types/api";
import { HALAMAN_PUBLIK } from "../akses";
import { ROUTE } from "../nav";
import { type KodeErrorKlien, isKodeError, pesanError } from "./pesan-error";
import { requestDenganProgres, type ProgresUnggah } from "./upload-progress";

/** Error dari pemanggilan API, dengan pesan yang siap ditampilkan ke pengguna. */
export class ApiError extends Error {
  /** Kode error kontrak, atau "JARINGAN" jika request tidak sampai ke server. */
  readonly code: KodeErrorKlien;
  /** Status HTTP; 0 untuk error jaringan. */
  readonly status: number;
  /** Pesan per field dari server untuk error validasi (mis. `FORMAT_TIDAK_VALID`). */
  readonly fields?: Record<string, string>;
  /** Pesan asli dari server, untuk debugging. Jangan ditampilkan ke pengguna. */
  readonly pesanServer?: string;

  constructor(
    code: KodeErrorKlien,
    status: number,
    options: { fields?: Record<string, string>; pesanServer?: string } = {},
  ) {
    super(pesanError(code));
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = options.fields;
    this.pesanServer = options.pesanServer;
  }
}

/** Hasil endpoint list: `GET /api/laporan`, `GET /api/penukaran`. */
export type HasilList<T> = {
  data: T[];
  meta: PaginationMeta;
};

type NilaiQuery = string | number | boolean | null | undefined;

export type OpsiRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Objek dikirim sebagai JSON; `FormData` dikirim sebagai multipart. */
  body?: unknown;
  /** Query string; nilai `undefined`/`null` dilewati. */
  query?: Record<string, NilaiQuery>;
  signal?: AbortSignal;
  /** FE-11: progres byte asli. Tanpa callback, transport fetch tetap dipakai. */
  onUploadProgress?: (progres: ProgresUnggah) => void;
};

function buatUrl(path: string, query?: OpsiRequest["query"]): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(query)) {
    if (nilai !== undefined && nilai !== null) params.append(kunci, String(nilai));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Di browser, path relatif (`/api/...`) dipakai apa adanya. Di luar browser (test Vitest),
 * `fetch` butuh URL absolut, jadi path diawali origin `http://localhost`.
 */
function urlAbsolut(url: string): string {
  if (typeof window !== "undefined" || /^https?:\/\//.test(url)) return url;
  return `http://localhost${url}`;
}

function bacaErrorKontrak(json: unknown): ApiErrorPayload | null {
  if (typeof json !== "object" || json === null || !("error" in json)) return null;
  const error = (json as { error: unknown }).error;
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return error as ApiErrorPayload;
}

type ApiErrorPayload = {
  code: unknown;
  message?: unknown;
  fields?: unknown;
};

let penundaRequest: Promise<unknown> | null = null;

/**
 * Tahan semua request API sampai `promise` selesai. Dipakai `MswProvider` agar request
 * pertama tidak lolos ke BE sebelum mock siap. Kegagalan `promise` tidak menghalangi request.
 */
export function tahanRequestSampai(promise: Promise<unknown>): void {
  penundaRequest = promise.catch(() => undefined);
}

let sedangKeLogin = false;

/**
 * Penanganan bawaan saat API membalas `UNAUTHORIZED` (FE-05): hapus cookie sesi lewat logout,
 * lalu pindah ke halaman Login. Logout lebih dulu mencegah loop jika cookie masih lolos proxy
 * (mis. akun sudah tidak ada) sementara API menolaknya. Tidak berjalan di halaman publik dan
 * hanya sekali walaupun beberapa request gagal bersamaan.
 */
function arahkanKeLogin(): void {
  if (typeof window === "undefined" || sedangKeLogin) return;
  if (HALAMAN_PUBLIK.includes(window.location.pathname)) return;
  sedangKeLogin = true;
  fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
    .catch(() => undefined)
    .finally(() => window.location.assign(ROUTE.login));
}

let penanganSesiHabis: (() => void) | null = arahkanKeLogin;

/**
 * Ganti penanganan respons `UNAUTHORIZED`; `null` untuk menonaktifkan. Dipakai di test.
 * `LOGIN_GAGAL` (login salah) tidak memicu penanganan ini.
 */
export function aturPenangananSesiHabis(penangan: (() => void) | null): void {
  penanganSesiHabis = penangan;
}

async function kirim(path: string, opsi: OpsiRequest = {}): Promise<unknown> {
  if (penundaRequest) await penundaRequest;
  const { method = "GET", body, query, signal, onUploadProgress } = opsi;
  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    // Jangan set Content-Type: browser menambahkan boundary multipart sendiri.
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    const url = urlAbsolut(buatUrl(path, query));
    res = onUploadProgress ? await requestDenganProgres(url, { method, headers, body: payload, signal, onUploadProgress }) : await fetch(url, {
      method,
      headers,
      body: payload,
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    // Request yang sengaja dibatalkan diteruskan apa adanya agar pemanggil bisa mengabaikannya.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("JARINGAN", 0);
  }

  let json: unknown = null;
  const teks = await res.text();
  if (teks) {
    try {
      json = JSON.parse(teks);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const error = bacaErrorKontrak(json);
    const code: KodeError = isKodeError(error?.code) ? error.code : "INTERNAL_ERROR";
    if (code === "UNAUTHORIZED") penanganSesiHabis?.();
    throw new ApiError(code, res.status, {
      fields: isPesanField(error?.fields) ? error.fields : undefined,
      pesanServer: typeof error?.message === "string" ? error.message : undefined,
    });
  }

  if (typeof json !== "object" || json === null || !("data" in json)) {
    // Sukses tapi bentuknya tidak sesuai kontrak: perlakukan sebagai error server.
    throw new ApiError("INTERNAL_ERROR", res.status, {
      pesanServer: "Respons tidak berisi `data`.",
    });
  }

  return json;
}

function isPesanField(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((pesan) => typeof pesan === "string")
  );
}

/** Panggil endpoint yang merespons `{ data }`; mengembalikan isi `data`. */
export async function apiRequest<T>(path: string, opsi?: OpsiRequest): Promise<T> {
  const json = (await kirim(path, opsi)) as { data: T };
  return json.data;
}

/** Panggil endpoint list yang merespons `{ data, meta }`. */
export async function apiRequestList<T>(path: string, opsi?: OpsiRequest): Promise<HasilList<T>> {
  const json = (await kirim(path, opsi)) as { data: T[]; meta?: PaginationMeta };
  if (!json.meta) {
    throw new ApiError("INTERNAL_ERROR", 200, { pesanServer: "Respons list tidak berisi `meta`." });
  }
  return { data: json.data, meta: json.meta };
}

type OpsiTanpaMethod = Omit<OpsiRequest, "method" | "body">;

/** Pintasan untuk method yang dipakai kontrak. */
export const api = {
  get: <T>(path: string, opsi?: OpsiTanpaMethod) => apiRequest<T>(path, { ...opsi, method: "GET" }),
  getList: <T>(path: string, opsi?: OpsiTanpaMethod) =>
    apiRequestList<T>(path, { ...opsi, method: "GET" }),
  post: <T>(path: string, body?: unknown, opsi?: OpsiTanpaMethod) =>
    apiRequest<T>(path, { ...opsi, method: "POST", body }),
};

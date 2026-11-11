/**
 * Fungsi bertipe untuk setiap endpoint di "Daftar endpoint" kontrak (FE-04).
 *
 * Halaman sebaiknya memanggil fungsi di sini, bukan menulis path sendiri, supaya path,
 * method, dan tipe request/respons hanya didefinisikan di satu tempat.
 *
 * Contoh:
 *   import { authApi } from "@/lib/api/endpoints";
 *   const pengguna = await authApi.login({ email, password });
 */
import type {
  AuthResponse,
  BuatLaporanRequest,
  BuatLaporanResponse,
  JenisLaporan,
  Laporan,
  LaporanDetail,
  LoginRequest,
  Lokasi,
  LokasiDetail,
  MediaUploadResponse,
  MeResponse,
  Notifikasi,
  OkResponse,
  Penukaran,
  RegisterRequest,
  Reward,
  SaldoPoinResponse,
  SetujuiLaporanRequest,
  SetujuiLaporanResponse,
  StatusLaporan,
  StatusLokasi,
  TolakLaporanRequest,
  TolakLaporanResponse,
  TukarPoinRequest,
  TukarPoinResponse,
} from "../../types/api";
import { api } from "./client";
import type { ProgresUnggah } from "./upload-progress";

type Opsi = { signal?: AbortSignal };

export type QueryDaftarLaporan = {
  jenis?: JenisLaporan;
  /** Default server: BELUM_DIPERIKSA. */
  status?: StatusLaporan;
  sort?: "terbaru" | "terlama";
  page?: number;
  /** Default server: 6. */
  limit?: number;
};

export type QueryHalaman = {
  page?: number;
  limit?: number;
};

export const authApi = {
  /** POST /api/auth/register (I-02). */
  register: (body: RegisterRequest, opsi?: Opsi) =>
    api.post<AuthResponse>("/api/auth/register", body, opsi),
  /** POST /api/auth/login (I-01); server memasang cookie session. */
  login: (body: LoginRequest, opsi?: Opsi) => api.post<AuthResponse>("/api/auth/login", body, opsi),
  /** POST /api/auth/logout; server menghapus cookie session. */
  logout: (opsi?: Opsi) => api.post<OkResponse>("/api/auth/logout", undefined, opsi),
  /** GET /api/me (I-03, Profil). */
  me: (opsi?: Opsi) => api.get<MeResponse>("/api/me", opsi),
};

export const mediaApi = {
  /** POST /api/media; `file` JPG/PNG/MP4, maks. 20 MB, dikirim sebagai multipart. */
  upload: (file: File | Blob, opsi?: Opsi & { onUploadProgress?: (progres: ProgresUnggah) => void }) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<MediaUploadResponse>("/api/media", form, opsi);
  },
};

export const laporanApi = {
  /** POST /api/laporan (UC01 ReportIt, UC05 CleanIt). */
  buat: (body: BuatLaporanRequest, opsi?: Opsi) =>
    api.post<BuatLaporanResponse>("/api/laporan", body, opsi),
  /** GET /api/laporan (Operator, I-07); mengembalikan `data` + `meta`. */
  daftar: (query: QueryDaftarLaporan = {}, opsi?: Opsi) =>
    api.getList<Laporan>("/api/laporan", { ...opsi, query }),
  /** GET /api/laporan/:id (Operator, I-08). */
  detail: (idLaporan: number, opsi?: Opsi) =>
    api.get<LaporanDetail>(`/api/laporan/${idLaporan}`, opsi),
  /** POST /api/laporan/:id/setujui (Operator). `poin`/`namaLokasi` khusus ReportIt. */
  setujui: (idLaporan: number, body: SetujuiLaporanRequest = {}, opsi?: Opsi) =>
    api.post<SetujuiLaporanResponse>(`/api/laporan/${idLaporan}/setujui`, body, opsi),
  /** POST /api/laporan/:id/tolak (Operator). `alasan` wajib untuk CleanIt. */
  tolak: (idLaporan: number, body: TolakLaporanRequest = {}, opsi?: Opsi) =>
    api.post<TolakLaporanResponse>(`/api/laporan/${idLaporan}/tolak`, body, opsi),
};

export const lokasiApi = {
  /** GET /api/lokasi (I-09, I-10); default server status TERCEMAR. */
  daftar: (query: { status?: StatusLokasi } = {}, opsi?: Opsi) =>
    api.get<Lokasi[]>("/api/lokasi", { ...opsi, query }),
  /** GET /api/lokasi/:id. */
  detail: (idLokasi: number, opsi?: Opsi) => api.get<LokasiDetail>(`/api/lokasi/${idLokasi}`, opsi),
};

export const poinApi = {
  /** GET /api/poin/saldo (Masyarakat). */
  saldo: (opsi?: Opsi) => api.get<SaldoPoinResponse>("/api/poin/saldo", opsi),
};

export const rewardApi = {
  /** GET /api/reward; semua reward, stok > 0 dulu lalu harga naik. */
  daftar: (opsi?: Opsi) => api.get<Reward[]>("/api/reward", opsi),
};

export const penukaranApi = {
  /** POST /api/penukaran (Masyarakat, UC09). */
  tukar: (body: TukarPoinRequest, opsi?: Opsi) =>
    api.post<TukarPoinResponse>("/api/penukaran", body, opsi),
  /** GET /api/penukaran (Masyarakat, riwayat); mengembalikan `data` + `meta`. */
  riwayat: (query: QueryHalaman = {}, opsi?: Opsi) =>
    api.getList<Penukaran>("/api/penukaran", { ...opsi, query }),
};

export const notifikasiApi = {
  /** GET /api/notifikasi (Masyarakat), urut waktu terbaru. */
  daftar: (opsi?: Opsi) => api.get<Notifikasi[]>("/api/notifikasi", opsi),
  /** POST /api/notifikasi/dibaca (Masyarakat). */
  tandaiDibaca: (opsi?: Opsi) => api.post<OkResponse>("/api/notifikasi/dibaca", undefined, opsi),
};

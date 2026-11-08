/**
 * Tipe bersama FE–BE untuk kontrak API SoClean v0.7.
 *
 * Sumber: docs/contracts/SoClean — Pembagian Tugas FE & BE v0.7.md, bagian
 * "Kontrak awal" (Konvensi, Daftar endpoint, Bentuk objek utama, Kode error).
 *
 * File ini hanya berisi tipe (tanpa kode runtime, tanpa akses database) agar
 * aman diimpor dari view maupun dari server. Nama field mengikuti kontrak
 * (camelCase); nama kolom database (snake_case) tidak dipakai di sini.
 *
 * Jika kontrak berubah, ubah file ini di PR yang sama.
 */

// ---------------------------------------------------------------------------
// Enum dasar
// ---------------------------------------------------------------------------

export type Role = "MASYARAKAT" | "OPERATOR";

export type JenisLaporan = "REPORTIT" | "CLEANIT";

export type StatusLaporan = "BELUM_DIPERIKSA" | "VALID" | "TIDAK_VALID";

export type StatusLokasi = "TERCEMAR" | "DIBERSIHKAN";

export type TipeMedia = "FOTO" | "VIDEO";

export type Sumber =
  | "PENGAMATAN_PRIBADI"
  | "INFO_WARGA"
  | "MEDIA_SOSIAL"
  | "LAINNYA";

export type JenisSampah =
  | "PLASTIK"
  | "KEMASAN_STYROFOAM"
  | "RUMAH_TANGGA"
  | "ORGANIK"
  | "LAINNYA";

/** Pilihan poin yang boleh dipilih Operator saat menyetujui ReportIt (K3). */
export type PilihanPoin = 50 | 100 | 200;

// ---------------------------------------------------------------------------
// Bentuk objek utama (kontrak, "Bentuk objek utama")
// ---------------------------------------------------------------------------

/** Pengguna yang dikembalikan register/login. */
export type Pengguna = {
  id: string;
  nama: string;
  email: string;
  role: Role;
};

/** GET /api/me — data akun yang sedang login. */
export type PenggunaMe = Pengguna & {
  saldoPoin: number;
};

/**
 * Media yang sudah diunggah. `url` adalah presigned URL yang dibuat saat
 * dibaca, sedangkan `createdAt` adalah waktu unggah.
 */
export type Media = {
  idMedia: number;
  url: string;
  tipe: TipeMedia;
  createdAt: string;
};

export type Laporan = {
  idLaporan: number;
  jenis: JenisLaporan;
  judul: string;
  /** CleanIt: diisi dari lokasi terkait. */
  lokasi: string;
  latitude: number;
  longitude: number;
  /** Waktu kejadian yang diisi pengguna. */
  waktu: string;
  /** Waktu laporan masuk, diisi server. */
  createdAt: string;
  /** null untuk CleanIt. */
  sumber: Sumber | null;
  /** CleanIt: diisi dari lokasi terkait. */
  jenisSampah: JenisSampah;
  status: StatusLaporan;
};

export type LaporanDetail = Laporan & {
  media: Media[];
  pelapor: {
    id: string;
    nama: string;
  };
  lokasiId: number | null;
  alasanPenolakan: string | null;
  /**
   * Khusus ReportIt yang masih BELUM_DIPERIKSA (K13): lokasi TERCEMAR terdekat
   * dalam radius 50 m yang akan menjadi tujuan penggabungan; null jika tidak
   * ada, jika laporan sudah diverifikasi, atau untuk CleanIt.
   */
  lokasiTerdekat: {
    idLokasi: number;
    nama: string;
    jarakMeter: number;
  } | null;
  /** Khusus CleanIt (N9); null untuk ReportIt. */
  laporanAsal: {
    idLaporan: number;
    judul: string;
    waktu: string;
    media: Media[];
  } | null;
  /** CleanIt: pengirim = pelapor asal lokasi. */
  pelaporAsalSama: boolean | null;
  /**
   * CleanIt: jumlah CleanIt pengguna ini untuk lokasi laporannya sendiri
   * dalam 30 hari terakhir, tidak termasuk laporan ini.
   */
  jumlahBersihkanSendiri30Hari: number | null;
};

export type Lokasi = {
  idLokasi: number;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  jenisSampah: JenisSampah;
  status: StatusLokasi;
  poin: PilihanPoin;
  /** created_at laporan asal lokasi. */
  dilaporkanAt: string;
};

/** KF07: detail lokasi memuat waktu, sumber, dan bukti dari laporan asal. */
export type LokasiDetail = Lokasi & {
  laporanAsal: {
    idLaporan: number;
    judul: string;
    waktu: string;
    sumber: Sumber;
    media: Media[];
  };
};

/** stok 0 ditampilkan FE sebagai "Habis" (N3). */
export type Reward = {
  idReward: number;
  nama: string;
  jenis: string;
  hargaPoin: number;
  stok: number;
};

export type Penukaran = {
  idPenukaran: string;
  namaReward: string;
  /** SC-XXXX-XXXX, voucher dummy (K5). */
  kodeVoucher: string;
  poinDipakai: number;
  waktuPenukaran: string;
};

/**
 * Diturunkan dari laporan yang sudah diverifikasi; FE menyusun teks pesannya.
 */
export type Notifikasi = {
  idLaporan: number;
  jenis: JenisLaporan;
  judul: string;
  status: "VALID" | "TIDAK_VALID";
  alasanPenolakan: string | null;
  /** Hanya CleanIt yang VALID (ReportIt tidak mendapat poin, N1). */
  poinDiberikan: number | null;
  /** diverifikasi_at. */
  waktu: string;
  dibaca: boolean;
};

// ---------------------------------------------------------------------------
// Request endpoint (kontrak, "Daftar endpoint")
// ---------------------------------------------------------------------------

export type RegisterRequest = {
  nama: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

type BuatLaporanDasar = {
  judul: string;
  waktu: string;
  idMedia: number[];
};

/** POST /api/laporan — ReportIt atau CleanIt. */
export type BuatLaporanRequest =
  | (BuatLaporanDasar & {
      jenis: "REPORTIT";
      lokasi: string;
      latitude: number;
      longitude: number;
      sumber: Sumber;
      jenisSampah: JenisSampah;
    })
  | (BuatLaporanDasar & {
      jenis: "CLEANIT";
      lokasiId: number;
    });

/** POST /api/laporan/:id/setujui — hanya dipakai untuk ReportIt. */
export type SetujuiLaporanRequest = {
  poin?: PilihanPoin;
  namaLokasi?: string;
};

/** POST /api/laporan/:id/tolak — alasan wajib untuk CleanIt. */
export type TolakLaporanRequest = {
  alasan?: string;
};

/** POST /api/penukaran */
export type TukarPoinRequest = {
  idReward: number;
};

// ---------------------------------------------------------------------------
// Respons endpoint (kontrak, "Daftar endpoint")
// ---------------------------------------------------------------------------

/** POST /api/auth/register, POST /api/auth/login */
export type AuthResponse = Pengguna;

/** GET /api/me */
export type MeResponse = PenggunaMe;

/** POST /api/media */
export type MediaUploadResponse = {
  idMedia: number;
  url: string;
  tipe: TipeMedia;
};

/** POST /api/laporan */
export type BuatLaporanResponse = {
  idLaporan: number;
  status: "BELUM_DIPERIKSA";
};

/**
 * POST /api/laporan/:id/setujui.
 * `idLokasi` dan `digabung` untuk ReportIt; `poinDiberikan` untuk CleanIt.
 */
export type SetujuiLaporanResponse = {
  idLaporan: number;
  status: "VALID";
  idLokasi?: number;
  digabung?: boolean;
  poinDiberikan?: number;
};

/** POST /api/laporan/:id/tolak */
export type TolakLaporanResponse = {
  idLaporan: number;
  status: "TIDAK_VALID";
};

/** GET /api/poin/saldo */
export type SaldoPoinResponse = {
  saldoPoin: number;
};

/** POST /api/penukaran */
export type TukarPoinResponse = Penukaran & {
  sisaPoin: number;
};

/** POST /api/auth/logout, POST /api/notifikasi/dibaca */
export type OkResponse = {
  ok: true;
};

// ---------------------------------------------------------------------------
// Wrapper respons (kontrak, "Format respons API")
// ---------------------------------------------------------------------------

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

/** Respons sukses: { "data": ... } */
export type ApiResponse<T> = {
  data: T;
};

/** Respons list: { "data": [...], "meta": { page, limit, total } } */
export type ApiListResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

/** Kode error dari tabel "Kode error" kontrak v0.7. */
export type KodeError =
  | "DATA_TIDAK_LENGKAP"
  | "FORMAT_TIDAK_VALID"
  | "UNAUTHORIZED"
  | "LOGIN_GAGAL"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "EMAIL_TERDAFTAR"
  | "SUDAH_DIVERIFIKASI"
  | "LOKASI_SUDAH_DIBERSIHKAN"
  | "CLEANIT_SUDAH_MENUNGGU"
  | "MEDIA_SUDAH_DIGUNAKAN"
  | "FILE_TERLALU_BESAR"
  | "TIPE_FILE_TIDAK_DIDUKUNG"
  | "POIN_TIDAK_CUKUP"
  | "STOK_HABIS"
  | "DI_LUAR_WILAYAH"
  | "INTERNAL_ERROR";

/** Respons gagal: { "error": { code, message, fields? } } */
export type ApiErrorResponse = {
  error: {
    code: KodeError;
    message: string;
    /** Pesan per field untuk error validasi. */
    fields?: Record<string, string>;
  };
};

/** Hasil request API: sukses atau gagal. */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Tipe respons per endpoint yang sering dipakai FE
// ---------------------------------------------------------------------------

export type LaporanListResponse = ApiListResponse<Laporan>;
export type LaporanDetailResponse = ApiResponse<LaporanDetail>;
export type LokasiListResponse = ApiResponse<Lokasi[]>;
export type LokasiDetailResponse = ApiResponse<LokasiDetail>;
export type RewardListResponse = ApiResponse<Reward[]>;
export type PenukaranListResponse = ApiListResponse<Penukaran>;
export type NotifikasiListResponse = ApiResponse<Notifikasi[]>;

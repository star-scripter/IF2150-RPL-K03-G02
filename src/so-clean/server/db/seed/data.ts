/**
 * Data seed (BE-03). Semua data FIKTIF: nama, email (domain .test yang dicadangkan untuk
 * pengujian), laporan, dan reward dummy. Waktu ditulis relatif ("hariLalu") terhadap saat seed
 * dijalankan, supaya urutan "Terbaru", notifikasi, dan hitungan 30 hari selalu masuk akal.
 *
 * Saldo poin pengguna dan stok reward TIDAK ditulis di sini; keduanya dihitung oleh seed dari
 * CleanIt yang VALID dan riwayat penukaran, sehingga selalu konsisten.
 */
import type { JenisSampah, Sumber } from "@/types/api";

/** Password semua akun uji (memenuhi aturan akun: 8–72 karakter, tidak sama dengan email). */
export const PASSWORD_UJI = "soclean123";

export type AkunSeed = {
  kunci: string;
  nama: string;
  email: string;
  role: "MASYARAKAT" | "OPERATOR";
  /** Notifikasi yang diverifikasi sebelum (sekarang − n hari) dianggap sudah dibaca. */
  notifikasiDilihatHariLalu?: number;
};

export const AKUN: AkunSeed[] = [
  { kunci: "operator", nama: "Operator SoClean", email: "operator@soclean.test", role: "OPERATOR" },
  { kunci: "operator2", nama: "Operator Cadangan", email: "operator2@soclean.test", role: "OPERATOR" },
  // Punya riwayat lengkap: ReportIt valid, CleanIt valid dan ditolak, penukaran.
  {
    kunci: "budi",
    nama: "Budi Santoso",
    email: "budi@soclean.test",
    role: "MASYARAKAT",
    notifikasiDilihatHariLalu: 4,
  },
  // Pelapor asal lokasi yang sedang dibersihkan orang lain.
  { kunci: "sari", nama: "Sari Wulandari", email: "sari@soclean.test", role: "MASYARAKAT" },
  // Saldo 0 (demo tombol "Kurang"), membersihkan lokasi laporannya sendiri.
  { kunci: "andi", nama: "Andi Pratama", email: "andi@soclean.test", role: "MASYARAKAT" },
];

export type RewardSeed = {
  kunci: string;
  nama: string;
  jenis: string;
  deskripsi: string;
  hargaPoin: number;
  /** Stok sebelum dikurangi penukaran di seed. */
  stokAwal: number;
};

// Harga diselaraskan dengan poin lokasi 50/100/200 (BE-03). Tote bag stok 0 untuk demo "Habis".
export const REWARD: RewardSeed[] = [
  {
    kunci: "kopi",
    nama: "Voucher Kopi Rp25.000",
    jenis: "VOUCHER",
    deskripsi: "Voucher minuman di kedai mitra (dummy).",
    hargaPoin: 50,
    stokAwal: 20,
  },
  {
    kunci: "tumbler",
    nama: "Tumbler SoClean",
    jenis: "MERCHANDISE",
    deskripsi: "Tumbler stainless 500 ml (dummy).",
    hargaPoin: 100,
    stokAwal: 10,
  },
  {
    kunci: "totebag",
    nama: "Tote Bag Daur Ulang",
    jenis: "MERCHANDISE",
    deskripsi: "Tas dari bahan daur ulang (dummy).",
    hargaPoin: 100,
    stokAwal: 0,
  },
  {
    kunci: "mangrove",
    nama: "Donasi 5 Bibit Mangrove",
    jenis: "DONASI",
    deskripsi: "Bibit mangrove ditanam atas nama Anda (dummy).",
    hargaPoin: 200,
    stokAwal: 15,
  },
  {
    kunci: "belanja",
    nama: "Voucher Belanja Rp100.000",
    jenis: "VOUCHER",
    deskripsi: "Voucher belanja di toko mitra (dummy).",
    hargaPoin: 200,
    stokAwal: 5,
  },
];

export type ReportItSeed = {
  kunci: string;
  pelapor: string;
  judul: string;
  lokasiTeks: string;
  latitude: number;
  longitude: number;
  sumber: Sumber;
  jenisSampah: JenisSampah;
  hariLalu: number;
  /** Jumlah foto bukti (1–3). */
  jumlahMedia: number;
  status: "BELUM_DIPERIKSA" | "VALID" | "TIDAK_VALID";
  alasanPenolakan?: string;
  /** Hanya untuk VALID: lokasi yang dibuat saat disetujui. */
  lokasi?: { nama: string; poin: 50 | 100 | 200 };
};

export const REPORTIT: ReportItSeed[] = [
  // --- VALID → lokasi TERCEMAR ---
  {
    kunci: "r-cikapundung-1",
    pelapor: "budi",
    judul: "Tumpukan plastik di bantaran Teras Cikapundung",
    lokasiTeks: "Teras Cikapundung, dekat jembatan, Bandung",
    latitude: -6.886,
    longitude: 107.6065,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    hariLalu: 12,
    jumlahMedia: 2,
    status: "VALID",
    lokasi: { nama: "Bantaran Teras Cikapundung", poin: 100 },
  },
  {
    kunci: "r-cikapundung-2",
    pelapor: "sari",
    judul: "Sampah organik menyumbat aliran Cikapundung",
    lokasiTeks: "Aliran Sungai Cikapundung sisi utara, Bandung",
    latitude: -6.881,
    longitude: 107.6075,
    sumber: "INFO_WARGA",
    jenisSampah: "ORGANIK",
    hariLalu: 9,
    jumlahMedia: 1,
    status: "VALID",
    lokasi: { nama: "Aliran Cikapundung Utara", poin: 50 },
  },
  {
    kunci: "r-ancol-1",
    pelapor: "sari",
    judul: "Sampah styrofoam di bibir Pantai Ancol",
    lokasiTeks: "Pantai Ancol sisi barat, Jakarta Utara",
    latitude: -6.122,
    longitude: 106.835,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "KEMASAN_STYROFOAM",
    hariLalu: 11,
    jumlahMedia: 2,
    status: "VALID",
    lokasi: { nama: "Bibir Pantai Ancol Barat", poin: 50 },
  },
  {
    kunci: "r-pangandaran-1",
    pelapor: "andi",
    judul: "Sampah rumah tangga terbawa ombak",
    lokasiTeks: "Pantai Barat Pangandaran",
    latitude: -7.7,
    longitude: 108.65,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "RUMAH_TANGGA",
    hariLalu: 8,
    jumlahMedia: 1,
    status: "VALID",
    lokasi: { nama: "Pantai Barat Pangandaran", poin: 200 },
  },
  {
    kunci: "r-pangandaran-2",
    pelapor: "budi",
    judul: "Botol plastik di muara kecil Pangandaran",
    lokasiTeks: "Muara kecil dekat Pantai Timur Pangandaran",
    latitude: -7.69,
    longitude: 108.66,
    sumber: "MEDIA_SOSIAL",
    jenisSampah: "PLASTIK",
    hariLalu: 7,
    jumlahMedia: 1,
    status: "VALID",
    lokasi: { nama: "Muara Pangandaran Timur", poin: 100 },
  },
  // --- VALID → lokasi yang kemudian DIBERSIHKAN (lihat CLEANIT) ---
  {
    kunci: "r-ancol-2",
    pelapor: "budi",
    judul: "Kemasan plastik di dekat dermaga Ancol",
    lokasiTeks: "Dermaga Ancol, Jakarta Utara",
    latitude: -6.118,
    longitude: 106.855,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    hariLalu: 20,
    jumlahMedia: 1,
    status: "VALID",
    lokasi: { nama: "Dermaga Ancol", poin: 100 },
  },
  {
    kunci: "r-pangandaran-3",
    pelapor: "andi",
    judul: "Jaring dan kantong plastik di pasir",
    lokasiTeks: "Pantai Pangandaran sisi selatan",
    latitude: -7.715,
    longitude: 108.64,
    sumber: "INFO_WARGA",
    jenisSampah: "LAINNYA",
    hariLalu: 25,
    jumlahMedia: 1,
    status: "VALID",
    lokasi: { nama: "Pantai Pangandaran Selatan", poin: 200 },
  },
  // --- TIDAK_VALID (muncul sebagai notifikasi penolakan) ---
  {
    kunci: "r-ditolak",
    pelapor: "andi",
    judul: "Sampah di trotoar dekat pantai",
    lokasiTeks: "Jalan masuk Pantai Ancol",
    latitude: -6.128,
    longitude: 106.82,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    hariLalu: 5,
    jumlahMedia: 1,
    status: "TIDAK_VALID",
    alasanPenolakan: "Foto tidak menunjukkan sampah di perairan.",
  },
  // --- BELUM_DIPERIKSA (antrean Operator, tab ReportIt) ---
  {
    kunci: "r-antre-ancol",
    pelapor: "andi",
    judul: "Sampah plastik mengapung di Pantai Ancol timur",
    lokasiTeks: "Pantai Ancol sisi timur, Jakarta Utara",
    latitude: -6.13,
    longitude: 106.862,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "PLASTIK",
    hariLalu: 1,
    jumlahMedia: 2,
    status: "BELUM_DIPERIKSA",
  },
  {
    // ±30 m dari "Pantai Barat Pangandaran" → demo lokasiTerdekat/digabung (K13).
    kunci: "r-antre-dekat",
    pelapor: "sari",
    judul: "Masih banyak sampah di Pantai Barat Pangandaran",
    lokasiTeks: "Pantai Barat Pangandaran, dekat pos jaga",
    latitude: -7.70025,
    longitude: 108.65015,
    sumber: "PENGAMATAN_PRIBADI",
    jenisSampah: "RUMAH_TANGGA",
    hariLalu: 0.5,
    jumlahMedia: 1,
    status: "BELUM_DIPERIKSA",
  },
  {
    kunci: "r-antre-cikapundung",
    pelapor: "budi",
    judul: "Ban bekas dan plastik di tepi Cikapundung",
    lokasiTeks: "Tepi Sungai Cikapundung sisi selatan, Bandung",
    latitude: -6.891,
    longitude: 107.6055,
    sumber: "INFO_WARGA",
    jenisSampah: "LAINNYA",
    hariLalu: 2,
    jumlahMedia: 1,
    status: "BELUM_DIPERIKSA",
  },
];

export type CleanItSeed = {
  kunci: string;
  pelapor: string;
  /** Kunci ReportIt asal lokasi yang dibersihkan. */
  lokasiDari: string;
  judul: string;
  hariLalu: number;
  jumlahMedia: number;
  status: "BELUM_DIPERIKSA" | "VALID" | "TIDAK_VALID";
  alasanPenolakan?: string;
};

export const CLEANIT: CleanItSeed[] = [
  // VALID → lokasi DIBERSIHKAN, pelapor mendapat poin lokasi.
  {
    kunci: "c-dermaga",
    pelapor: "sari",
    lokasiDari: "r-ancol-2",
    judul: "Pembersihan Dermaga Ancol",
    hariLalu: 15,
    jumlahMedia: 2,
    status: "VALID",
  },
  {
    kunci: "c-pangandaran-selatan",
    pelapor: "budi",
    lokasiDari: "r-pangandaran-3",
    judul: "Pembersihan Pantai Pangandaran Selatan",
    hariLalu: 6,
    jumlahMedia: 1,
    status: "VALID",
  },
  // TIDAK_VALID (alasan wajib untuk CleanIt).
  {
    kunci: "c-ditolak",
    pelapor: "budi",
    lokasiDari: "r-cikapundung-1",
    judul: "Pembersihan Bantaran Teras Cikapundung",
    hariLalu: 3,
    jumlahMedia: 1,
    status: "TIDAK_VALID",
    alasanPenolakan: "Foto sesudah tidak menunjukkan lokasi yang sama dengan laporan asal.",
  },
  // BELUM_DIPERIKSA (antrean Operator, tab CleanIt).
  {
    // Dua CleanIt menunggu untuk lokasi yang sama → demo K12 (setujui satu, yang lain tertolak otomatis).
    kunci: "c-antre-ancol-budi",
    pelapor: "budi",
    lokasiDari: "r-ancol-1",
    judul: "Pembersihan Bibir Pantai Ancol Barat",
    hariLalu: 1,
    jumlahMedia: 2,
    status: "BELUM_DIPERIKSA",
  },
  {
    kunci: "c-antre-ancol-sari",
    pelapor: "sari",
    lokasiDari: "r-ancol-1",
    judul: "Bersih-bersih styrofoam Ancol Barat",
    hariLalu: 0.3,
    jumlahMedia: 1,
    status: "BELUM_DIPERIKSA",
  },
  {
    // Pelapor asal membersihkan lokasinya sendiri → tanda "Pelapor = Relawan" (Aturan CleanIt 6).
    kunci: "c-antre-andi-sendiri",
    pelapor: "andi",
    lokasiDari: "r-pangandaran-1",
    judul: "Pembersihan Pantai Barat Pangandaran",
    hariLalu: 0.8,
    jumlahMedia: 1,
    status: "BELUM_DIPERIKSA",
  },
];

export type PenukaranSeed = { pengguna: string; reward: string; hariLalu: number };

export const PENUKARAN: PenukaranSeed[] = [
  { pengguna: "budi", reward: "tumbler", hariLalu: 4 },
  { pengguna: "sari", reward: "kopi", hariLalu: 10 },
];

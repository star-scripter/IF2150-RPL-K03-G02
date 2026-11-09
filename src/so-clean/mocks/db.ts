/**
 * "Database" mock untuk MSW (FE-04). Semua data fiktif.
 *
 * Disimpan di memori, sehingga kembali ke data awal setiap halaman dimuat ulang
 * (atau setiap `resetDb()` dipanggil di test). Hanya sesi login yang disimpan di
 * sessionStorage agar tetap login setelah reload.
 *
 * Akun uji (password semuanya `password123`):
 * - masyarakat@soclean.test  (Masyarakat, saldo 67)
 * - rina@soclean.test        (Masyarakat, saldo 250)
 * - operator@soclean.test    (Operator)
 */
import type {
  JenisSampah,
  Laporan,
  Lokasi,
  Media,
  Penukaran,
  PilihanPoin,
  Reward,
  Role,
  Sumber,
} from "../types/api";

export type PenggunaMock = {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: Role;
  saldoPoin: number;
  notifikasiDilihatAt: string | null;
};

export type MediaMock = Media & {
  idPemilik: string;
  idLaporan: number | null;
};

export type LaporanMock = Laporan & {
  idPelapor: string;
  lokasiId: number | null;
  alasanPenolakan: string | null;
  diverifikasiAt: string | null;
  poinDiberikan: number | null;
};

export type LokasiMock = Lokasi & {
  idLaporanAsal: number;
};

export type PenukaranMock = Penukaran & {
  idPengguna: string;
};

export type DbMock = {
  pengguna: PenggunaMock[];
  media: MediaMock[];
  laporan: LaporanMock[];
  lokasi: LokasiMock[];
  reward: Reward[];
  penukaran: PenukaranMock[];
  urutan: { media: number; laporan: number; lokasi: number };
};

export const PASSWORD_UJI = "password123";

const JAM = 60 * 60 * 1000;

function jamLalu(jam: number): string {
  return new Date(Date.now() - jam * JAM).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Gambar placeholder lokal (SVG) agar mock tidak bergantung pada layanan luar. */
export function gambarDummy(teks: string, warna = "#094542"): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">` +
    `<rect width="100%" height="100%" fill="${warna}"/>` +
    `<text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="32" ` +
    `text-anchor="middle" dominant-baseline="middle">${teks}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function media(
  idMedia: number,
  idPemilik: string,
  idLaporan: number,
  teks: string,
  jam: number,
  warna?: string,
): MediaMock {
  return {
    idMedia,
    url: gambarDummy(teks, warna),
    tipe: "FOTO",
    createdAt: jamLalu(jam),
    idPemilik,
    idLaporan,
  };
}

type IsianReportIt = {
  idLaporan: number;
  idPelapor: string;
  judul: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  sumber: Sumber;
  jenisSampah: JenisSampah;
  jam: number;
};

function reportIt(isian: IsianReportIt): LaporanMock {
  return {
    idLaporan: isian.idLaporan,
    jenis: "REPORTIT",
    judul: isian.judul,
    lokasi: isian.lokasi,
    latitude: isian.latitude,
    longitude: isian.longitude,
    waktu: jamLalu(isian.jam + 1),
    createdAt: jamLalu(isian.jam),
    sumber: isian.sumber,
    jenisSampah: isian.jenisSampah,
    status: "BELUM_DIPERIKSA",
    idPelapor: isian.idPelapor,
    lokasiId: null,
    alasanPenolakan: null,
    diverifikasiAt: null,
    poinDiberikan: null,
  };
}

function lokasi(
  idLokasi: number,
  asal: LaporanMock,
  nama: string,
  poin: PilihanPoin,
  status: Lokasi["status"] = "TERCEMAR",
): LokasiMock {
  return {
    idLokasi,
    nama,
    alamat: asal.lokasi,
    latitude: asal.latitude,
    longitude: asal.longitude,
    jenisSampah: asal.jenisSampah,
    status,
    poin,
    dilaporkanAt: asal.createdAt,
    idLaporanAsal: asal.idLaporan,
  };
}

function valid(laporan: LaporanMock, jamVerifikasi: number, lokasiId: number): LaporanMock {
  return { ...laporan, status: "VALID", lokasiId, diverifikasiAt: jamLalu(jamVerifikasi) };
}

function cleanIt(
  idLaporan: number,
  idPelapor: string,
  lok: LokasiMock,
  jam: number,
): LaporanMock {
  return {
    idLaporan,
    jenis: "CLEANIT",
    judul: `Pembersihan ${lok.nama}`.slice(0, 80),
    lokasi: lok.nama,
    latitude: lok.latitude,
    longitude: lok.longitude,
    waktu: jamLalu(jam + 1),
    createdAt: jamLalu(jam),
    sumber: null,
    jenisSampah: lok.jenisSampah,
    status: "BELUM_DIPERIKSA",
    idPelapor,
    lokasiId: lok.idLokasi,
    alasanPenolakan: null,
    diverifikasiAt: null,
    poinDiberikan: null,
  };
}

function buatDataAwal(): DbMock {
  const dapin = "11111111-1111-4111-8111-111111111111";
  const rina = "22222222-2222-4222-8222-222222222222";
  const operator = "33333333-3333-4333-8333-333333333333";

  const pengguna: PenggunaMock[] = [
    {
      id: dapin,
      nama: "Dapin Tampan",
      email: "masyarakat@soclean.test",
      password: PASSWORD_UJI,
      role: "MASYARAKAT",
      saldoPoin: 67,
      notifikasiDilihatAt: jamLalu(100),
    },
    {
      id: rina,
      nama: "Rina Relawan",
      email: "rina@soclean.test",
      password: PASSWORD_UJI,
      role: "MASYARAKAT",
      saldoPoin: 250,
      notifikasiDilihatAt: null,
    },
    {
      id: operator,
      nama: "Opik Operator",
      email: "operator@soclean.test",
      password: PASSWORD_UJI,
      role: "OPERATOR",
      saldoPoin: 0,
      notifikasiDilihatAt: null,
    },
  ];

  // Laporan asal lokasi (sudah VALID).
  const asal1 = reportIt({
    idLaporan: 1, idPelapor: rina, judul: "Tumpukan plastik di bantaran sungai",
    lokasi: "Bantaran Teras Cikapundung, dekat jembatan", latitude: -6.885, longitude: 107.6065,
    sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK", jam: 300,
  });
  const asal2 = reportIt({
    idLaporan: 2, idPelapor: dapin, judul: "Styrofoam berserakan di pantai",
    lokasi: "Pantai Ancol sisi timur", latitude: -6.122, longitude: 106.845,
    sumber: "INFO_WARGA", jenisSampah: "KEMASAN_STYROFOAM", jam: 250,
  });
  const asal3 = reportIt({
    idLaporan: 3, idPelapor: rina, judul: "Sampah rumah tangga terbawa ombak",
    lokasi: "Pantai Barat Pangandaran", latitude: -7.698, longitude: 108.65,
    sumber: "MEDIA_SOSIAL", jenisSampah: "RUMAH_TANGGA", jam: 200,
  });
  const asal4 = reportIt({
    idLaporan: 4, idPelapor: dapin, judul: "Sampah organik menumpuk di dermaga",
    lokasi: "Dermaga Ancol", latitude: -6.118, longitude: 106.83,
    sumber: "PENGAMATAN_PRIBADI", jenisSampah: "ORGANIK", jam: 150,
  });

  const lokasiData: LokasiMock[] = [
    lokasi(1, asal1, "Bantaran Teras Cikapundung", 100),
    lokasi(2, asal2, "Pantai Ancol Timur", 50),
    lokasi(3, asal3, "Pantai Barat Pangandaran", 200, "DIBERSIHKAN"),
    lokasi(4, asal4, "Dermaga Ancol", 50),
  ];

  const laporan: LaporanMock[] = [
    valid(asal1, 290, 1),
    valid(asal2, 240, 2),
    valid(asal3, 190, 3),
    valid(asal4, 140, 4),
    // CleanIt VALID untuk lokasi 3 (sumber notifikasi poin untuk Dapin).
    {
      ...cleanIt(5, dapin, lokasiData[2], 60),
      status: "VALID",
      diverifikasiAt: jamLalu(20),
      poinDiberikan: 200,
    },
    // ReportIt menunggu, ±20 m dari lokasi 1 → `lokasiTerdekat` terisi (K13).
    reportIt({
      idLaporan: 6, idPelapor: dapin, judul: "Botol plastik di dekat jembatan",
      lokasi: "Teras Cikapundung", latitude: -6.88518, longitude: 107.6065,
      sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK", jam: 10,
    }),
    // ReportIt menunggu, jauh dari lokasi mana pun.
    reportIt({
      idLaporan: 7, idPelapor: rina, judul: "Jaring nelayan tersangkut di karang",
      lokasi: "Pantai Timur Pangandaran", latitude: -7.715, longitude: 108.67,
      sumber: "INFO_WARGA", jenisSampah: "LAINNYA", jam: 8,
    }),
    // CleanIt menunggu untuk lokasi 1 oleh Rina (pelapor asal → "Pelapor = Relawan").
    cleanIt(8, rina, lokasiData[0], 6),
    // CleanIt menunggu untuk lokasi 2 oleh Dapin (pelapor asal lokasi 2).
    cleanIt(9, dapin, lokasiData[1], 4),
    // ReportIt ditolak (notifikasi dengan alasan untuk Dapin).
    {
      ...reportIt({
        idLaporan: 10, idPelapor: dapin, judul: "Sampah di trotoar",
        lokasi: "Jalan Dago", latitude: -6.88, longitude: 107.607,
        sumber: "PENGAMATAN_PRIBADI", jenisSampah: "RUMAH_TANGGA", jam: 30,
      }),
      status: "TIDAK_VALID",
      alasanPenolakan: "Foto tidak menunjukkan sampah di area pesisir atau sungai.",
      diverifikasiAt: jamLalu(5),
    },
  ];

  // ReportIt menunggu tambahan agar pagination I-07 (6 per halaman) bisa dicoba.
  for (let i = 0; i < 6; i++) {
    laporan.push(
      reportIt({
        idLaporan: 11 + i,
        idPelapor: i % 2 === 0 ? rina : dapin,
        judul: `Sampah plastik di Pantai Ancol titik ${i + 1}`,
        lokasi: `Pantai Ancol, area ${i + 1}`,
        latitude: -6.125 + i * 0.001,
        longitude: 106.85 + i * 0.002,
        sumber: "PENGAMATAN_PRIBADI",
        jenisSampah: "PLASTIK",
        jam: 50 + i * 3,
      }),
    );
  }

  const mediaData: MediaMock[] = [
    media(1, rina, 1, "Sebelum: Cikapundung", 300),
    media(2, dapin, 2, "Sebelum: Ancol Timur", 250),
    media(3, rina, 3, "Sebelum: Pangandaran", 200),
    media(4, dapin, 4, "Sebelum: Dermaga Ancol", 150),
    media(5, dapin, 5, "Sesudah: Pangandaran", 60, "#05c274"),
    media(6, dapin, 6, "Botol plastik", 10),
    media(7, rina, 7, "Jaring nelayan", 8),
    media(8, rina, 8, "Sesudah: Cikapundung", 6, "#05c274"),
    media(9, dapin, 9, "Sesudah: Ancol Timur", 4, "#05c274"),
    media(10, dapin, 10, "Trotoar", 30),
    ...Array.from({ length: 6 }, (_, i) =>
      media(11 + i, i % 2 === 0 ? rina : dapin, 11 + i, `Ancol titik ${i + 1}`, 50 + i * 3),
    ),
  ];

  const reward: Reward[] = [
    { idReward: 1, nama: "Voucher Belanja Rp25.000", jenis: "VOUCHER", hargaPoin: 100, stok: 10 },
    { idReward: 2, nama: "Tumbler SoClean", jenis: "MERCHANDISE", hargaPoin: 250, stok: 5 },
    { idReward: 3, nama: "Tas Belanja Kain", jenis: "MERCHANDISE", hargaPoin: 80, stok: 0 },
    { idReward: 4, nama: "Voucher Transportasi Rp50.000", jenis: "VOUCHER", hargaPoin: 300, stok: 3 },
    { idReward: 5, nama: "Stiker SoClean", jenis: "MERCHANDISE", hargaPoin: 20, stok: 50 },
  ];

  const penukaran: PenukaranMock[] = [
    {
      idPenukaran: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      namaReward: "Stiker SoClean",
      kodeVoucher: "SC-7KQM-X4TD",
      poinDipakai: 20,
      waktuPenukaran: jamLalu(48),
      idPengguna: dapin,
    },
  ];

  return {
    pengguna,
    media: mediaData,
    laporan,
    lokasi: lokasiData,
    reward,
    penukaran,
    urutan: { media: 100, laporan: 100, lokasi: 100 },
  };
}

export let db: DbMock = buatDataAwal();

const KUNCI_SESI = "soclean-mock-sesi";
let sesiMemori: string | null = null;

/** Kembalikan semua data mock ke kondisi awal (dipakai di test). */
export function resetDb(): void {
  db = buatDataAwal();
  setSesi(null);
}

/** id pengguna yang sedang login di mock, atau null. */
export function getSesi(): string | null {
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage.getItem(KUNCI_SESI);
  } catch {
    // sessionStorage bisa diblokir; pakai memori.
  }
  return sesiMemori;
}

export function setSesi(idPengguna: string | null): void {
  sesiMemori = idPengguna;
  try {
    if (typeof sessionStorage === "undefined") return;
    if (idPengguna) sessionStorage.setItem(KUNCI_SESI, idPengguna);
    else sessionStorage.removeItem(KUNCI_SESI);
  } catch {
    // Abaikan; sesi tetap tersimpan di memori.
  }
}

export function waktuSekarang(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Fungsi murni halaman validasi laporan Operator: ID dan waktu pada kartu serta filter
 * tab/urutan/halaman di query URL (I-07, FE-22), dan label, isian, serta penanganan hasil
 * setujui/tolak di detail laporan (I-08, FE-23).
 */
import type {
  JenisLaporan,
  JenisSampah,
  LaporanDetail,
  PilihanPoin,
  SetujuiLaporanRequest,
  SetujuiLaporanResponse,
  StatusLaporan,
  Sumber,
  TolakLaporanRequest,
} from "../types/api";
import type { KodeErrorKlien } from "./api/pesan-error";
import { ROUTE } from "./nav";

export type UrutanLaporan = "terbaru" | "terlama";

export type FilterValidasi = {
  jenis: JenisLaporan;
  sort: UrutanLaporan;
  page: number;
};

// Kontrak FE-22: 6 laporan per halaman, sama dengan default `limit` GET /api/laporan.
export const LIMIT_VALIDASI = 6;

// Batas atas yang sama dengan validasi `page` di BE (BE-22).
const HALAMAN_MAKS = 1_000_000;

export const LABEL_JENIS: Record<JenisLaporan, string> = {
  REPORTIT: "ReportIt!",
  CLEANIT: "CleanIt!",
};

// Konvensi kontrak: ID laporan di UI ditulis "RPT-" + idLaporan minimal 4 digit.
export function formatIdLaporan(idLaporan: number): string {
  return `RPT-${String(idLaporan).padStart(4, "0")}`;
}

type BacaParam = { get(nama: string): string | null };

// Query bisa diketik pengguna; nilai yang tidak dikenal jatuh ke default ReportIt, terbaru, halaman 1.
export function bacaFilterValidasi(params: BacaParam): FilterValidasi {
  const page = params.get("page");
  const n = page && /^\d+$/.test(page) ? Number(page) : 1;
  return {
    jenis: params.get("jenis") === "cleanit" ? "CLEANIT" : "REPORTIT",
    sort: params.get("sort") === "terlama" ? "terlama" : "terbaru",
    page: n >= 1 && n <= HALAMAN_MAKS ? n : 1,
  };
}

// Nilai default tidak ditulis agar tampilan awal tetap beralamat /operator/laporan.
export function urlValidasi({ jenis, sort, page }: FilterValidasi): string {
  const query = new URLSearchParams();
  if (jenis === "CLEANIT") query.set("jenis", "cleanit");
  if (sort === "terlama") query.set("sort", "terlama");
  if (page > 1) query.set("page", String(page));
  const teks = query.toString();
  return teks ? `${ROUTE.operatorLaporan}?${teks}` : ROUTE.operatorLaporan;
}

const MENIT = 60 * 1000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

const FORMAT_TANGGAL_PENDEK = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

/**
 * Waktu pengiriman di kartu I-07, mis. "15 menit lalu"; lebih dari 7 hari ditulis tanggal WIB.
 * `sekarang` diberikan pemanggil agar hasilnya tetap sama selama satu kali render.
 */
export function formatWaktuKirim(iso: string, sekarang: number): string {
  // Jam server yang sedikit lebih cepat tidak boleh menghasilkan selisih negatif.
  const selisih = Math.max(0, sekarang - Date.parse(iso));
  if (selisih < MENIT) return "Baru saja";
  if (selisih < JAM) return `${Math.floor(selisih / MENIT)} menit lalu`;
  if (selisih < HARI) return `${Math.floor(selisih / JAM)} jam lalu`;
  if (selisih < 7 * HARI) return `${Math.floor(selisih / HARI)} hari lalu`;
  return FORMAT_TANGGAL_PENDEK.format(new Date(iso));
}

// Format lengkap seperti mockup I-08, mis. "14 Oktober 2023, 10.45 WIB".
export function formatWaktuLengkap(iso: string): string {
  const waktu = new Date(iso);
  return `${FORMAT_TANGGAL.format(waktu)}, ${FORMAT_JAM.format(waktu)} WIB`;
}

// Label "Sumber Laporan" (K8: bukan "Sumber Pencemaran" seperti mockup I-08).
export const LABEL_SUMBER: Record<Sumber, string> = {
  PENGAMATAN_PRIBADI: "Pengamatan pribadi",
  INFO_WARGA: "Info warga",
  MEDIA_SOSIAL: "Media sosial",
  LAINNYA: "Lainnya",
};

export const LABEL_JENIS_SAMPAH: Record<JenisSampah, string> = {
  PLASTIK: "Plastik",
  KEMASAN_STYROFOAM: "Kemasan styrofoam",
  RUMAH_TANGGA: "Sampah rumah tangga",
  ORGANIK: "Organik",
  LAINNYA: "Lainnya",
};

export const LABEL_STATUS: Record<StatusLaporan, string> = {
  BELUM_DIPERIKSA: "Menunggu validasi",
  VALID: "Valid",
  TIDAK_VALID: "Tidak valid",
};

// K3: Operator hanya boleh memilih 50, 100, atau 200 poin; default 50.
export const PILIHAN_POIN: readonly PilihanPoin[] = [50, 100, 200];
export const POIN_DEFAULT: PilihanPoin = 50;

// K9: `lokasi.nama` varchar(255).
export const MAKS_NAMA_LOKASI = 255;

// Label foto I08-11: waktu unggah (`media.createdAt`, sama dengan watermark K6), bukan waktu kejadian.
export function formatWaktuUnggah(iso: string): string {
  const waktu = new Date(iso);
  return `Diunggah ${FORMAT_TANGGAL_PENDEK.format(waktu)}, ${FORMAT_JAM.format(waktu)} WIB`;
}

// BE bisa mengirim jarak pecahan; ditampilkan sebagai meter bulat, mis. "32 m".
export function formatJarak(meter: number): string {
  return `${Math.round(meter).toLocaleString("id-ID")} m`;
}

export function formatKoordinat(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function urlPeta(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

export type IsianSetujui = { poin: PilihanPoin; namaLokasi: string };

/**
 * Body POST /api/laporan/:id/setujui. Poin dan nama lokasi hanya untuk ReportIt yang membuat
 * lokasi baru; CleanIt dan ReportIt yang digabung (K13) mengirim body kosong karena BE
 * mengabaikan keduanya.
 */
export function bodySetujui(detail: LaporanDetail, isian: IsianSetujui): SetujuiLaporanRequest {
  if (detail.jenis !== "REPORTIT" || detail.lokasiTerdekat) return {};
  return { poin: isian.poin, namaLokasi: isian.namaLokasi.trim() };
}

/** Pesan per field sebelum setujui dikirim; objek kosong berarti isian valid. */
export function cekIsianSetujui(detail: LaporanDetail, isian: IsianSetujui): Record<string, string> {
  const body = bodySetujui(detail, isian);
  if (body.namaLokasi === undefined) return {};
  if (body.namaLokasi === "") return { namaLokasi: "Nama lokasi wajib diisi." };
  if (body.namaLokasi.length > MAKS_NAMA_LOKASI) {
    return { namaLokasi: `Nama lokasi maksimal ${MAKS_NAMA_LOKASI} karakter.` };
  }
  return {};
}

// Alasan wajib untuk CleanIt (BE-15) dan opsional untuk ReportIt; alasan kosong tidak dikirim.
export function bodyTolak(alasan: string): TolakLaporanRequest {
  const teks = alasan.trim();
  return teks ? { alasan: teks } : {};
}

export function cekAlasanTolak(jenis: JenisLaporan, alasan: string): Record<string, string> {
  return jenis === "CLEANIT" && !alasan.trim()
    ? { alasan: "Alasan penolakan wajib diisi untuk CleanIt." }
    : {};
}

export function pesanSetujui(detail: LaporanDetail, respons: SetujuiLaporanResponse): string {
  if (detail.jenis === "CLEANIT") {
    return respons.poinDiberikan !== undefined
      ? `Laporan disetujui. ${respons.poinDiberikan.toLocaleString("id-ID")} poin diberikan kepada ${detail.pelapor.nama}.`
      : "Laporan disetujui.";
  }
  if (respons.digabung) {
    return detail.lokasiTerdekat
      ? `Laporan disetujui dan digabung ke ${detail.lokasiTerdekat.nama}.`
      : "Laporan disetujui dan digabung ke lokasi yang sudah ada.";
  }
  return "Laporan disetujui. Lokasi baru ditambahkan ke daftar CleanIt.";
}

/**
 * Tindakan I-08 saat setujui/tolak gagal:
 * - `selesai`: laporan tidak bisa diverifikasi lagi (sudah diverifikasi Operator lain, lokasi
 *   CleanIt sudah dibersihkan, atau laporan hilang); tombol dikunci dan list di-refresh.
 * - `isian`: isian ditolak BE; pesan ditampilkan per field dan Operator bisa memperbaikinya.
 * - `ulang`: error lain (server, jaringan); tombol tetap aktif agar bisa dicoba lagi.
 */
export function tindakanGagalVerifikasi(code: KodeErrorKlien): "selesai" | "isian" | "ulang" {
  switch (code) {
    case "SUDAH_DIVERIFIKASI":
    case "LOKASI_SUDAH_DIBERSIHKAN":
    case "NOT_FOUND":
      return "selesai";
    case "FORMAT_TIDAK_VALID":
    case "DATA_TIDAK_LENGKAP":
      return "isian";
    default:
      return "ulang";
  }
}

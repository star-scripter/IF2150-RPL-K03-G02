/** Validasi FE-10. Tidak mengimpor controller/model server dan tidak memeriksa media FE-11. */
import type { InformasiLaporan } from "@/lib/form-laporan";
import { LABEL_JENIS_SAMPAH, LABEL_SUMBER } from "@/lib/form-laporan";
import { MAKS_JUDUL } from "@/lib/judul";
import { WILAYAH, diDalamWilayah } from "@/lib/wilayah";

export type KoordinatLaporan = { latitude: number; longitude: number };
export type FieldInformasi = "judul" | "lokasi" | "waktu" | "koordinat" | "sumber" | "jenisSampah";
export type ErrorInformasi = Partial<Record<FieldInformasi, string>>;
export type HasilValidasiInformasi = {
  valid: boolean;
  code: "DATA_TIDAK_LENGKAP" | "FORMAT_TIDAK_VALID" | null;
  fields: ErrorInformasi;
};

export function koordinatValid(latitude: unknown, longitude: unknown): boolean {
  return typeof latitude === "number" && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && typeof longitude === "number" && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

export function ambilKoordinat(informasi: Pick<InformasiLaporan, "latitude" | "longitude">): KoordinatLaporan | null {
  return koordinatValid(informasi.latitude, informasi.longitude)
    ? { latitude: informasi.latitude!, longitude: informasi.longitude! }
    : null;
}

export function bacaKoordinat(latitude: string, longitude: string): KoordinatLaporan | null {
  if (!latitude.trim() || !longitude.trim()) return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return koordinatValid(lat, lng) ? { latitude: lat, longitude: lng } : null;
}

/** Klik pada salinan dunia Leaflet tetap menghasilkan bujur dalam rentang API. */
export function rapikanKoordinat(latitude: number, longitude: number): KoordinatLaporan {
  const lng = longitude >= -180 && longitude <= 180 ? longitude : ((longitude + 180) % 360 + 360) % 360 - 180;
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(lng.toFixed(6)) };
}

/** Parse datetime-local sebagai WIB, termasuk pemeriksaan tanggal kalender (bukan normalisasi Date). */
export function waktuWibKeIso(waktu: string): string | null {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(waktu);
  if (!cocok) return null;
  const [, y, m, d, h, menit, detik = "0", milidetik = "0"] = cocok;
  const nilai = [Number(y), Number(m), Number(d), Number(h), Number(menit), Number(detik), Number(milidetik.padEnd(3, "0"))];
  if (nilai[0] < 1) return null;
  const tanggal = new Date(`${waktu}+07:00`);
  if (Number.isNaN(tanggal.getTime())) return null;
  const lokal = new Date(tanggal.getTime() + 7 * 60 * 60 * 1000);
  const aktual = [lokal.getUTCFullYear(), lokal.getUTCMonth() + 1, lokal.getUTCDate(), lokal.getUTCHours(), lokal.getUTCMinutes(), lokal.getUTCSeconds(), lokal.getUTCMilliseconds()];
  return aktual.every((value, i) => value === nilai[i]) ? tanggal.toISOString() : null;
}

export function waktuMaksimumWib(sekarang = new Date()): string {
  return new Date(sekarang.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

function kosong(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

/** Meniru kelengkapan/format BE-10 untuk field I11. Wilayah adalah peringatan; keputusan akhir ada di BE. */
export function validasiInformasiDasar(informasi: InformasiLaporan, sekarang = new Date()): HasilValidasiInformasi {
  const fields: ErrorInformasi = {};
  let belumLengkap = false;
  function periksaTeks(field: "judul" | "lokasi", label: string, maks: number) {
    const value = informasi[field];
    if (kosong(value)) { fields[field] = `${label} wajib diisi.`; belumLengkap = true; }
    else if (typeof value !== "string" || value.trim().length > maks) fields[field] = `${label} maksimal ${maks} karakter.`;
  }
  periksaTeks("judul", "Judul laporan", MAKS_JUDUL);
  periksaTeks("lokasi", "Alamat / deskripsi lokasi", 255);
  if (kosong(informasi.latitude) || kosong(informasi.longitude)) {
    fields.koordinat = "Pilih titik lokasi melalui peta atau GPS.";
    belumLengkap = true;
  } else if (!koordinatValid(informasi.latitude, informasi.longitude)) {
    fields.koordinat = "Koordinat harus berupa latitude −90–90 dan longitude −180–180.";
  }
  if (kosong(informasi.waktu)) { fields.waktu = "Waktu kejadian wajib diisi."; belumLengkap = true; }
  else {
    const iso = typeof informasi.waktu === "string" ? waktuWibKeIso(informasi.waktu) : null;
    if (!iso) fields.waktu = "Pilih tanggal dan waktu kejadian yang valid.";
    else if (Date.parse(iso) > sekarang.getTime()) fields.waktu = "Waktu kejadian tidak boleh di masa depan.";
  }
  for (const [field, label, pilihan] of [
    ["sumber", "Sumber laporan", LABEL_SUMBER],
    ["jenisSampah", "Jenis sampah", LABEL_JENIS_SAMPAH],
  ] as const) {
    const value = informasi[field];
    if (kosong(value)) { fields[field] = `${label} wajib dipilih.`; belumLengkap = true; }
    else if (!Object.prototype.hasOwnProperty.call(pilihan, value)) fields[field] = `Pilih ${label.toLowerCase()} yang tersedia.`;
  }
  const valid = Object.keys(fields).length === 0;
  return { valid, code: valid ? null : belumLengkap ? "DATA_TIDAK_LENGKAP" : "FORMAT_TIDAK_VALID", fields };
}

export function wilayahTitik(koordinat: KoordinatLaporan) {
  return WILAYAH.find((w) => koordinat.latitude >= w.latMin && koordinat.latitude <= w.latMax
    && koordinat.longitude >= w.lngMin && koordinat.longitude <= w.lngMax) ?? null;
}

export function diLuarWilayah(koordinat: KoordinatLaporan | null): boolean {
  return koordinat !== null && !diDalamWilayah(koordinat.latitude, koordinat.longitude);
}

export function pesanKegagalanGps(code: number): string {
  if (code === 1) return "Izin lokasi ditolak. Izinkan lokasi di browser atau pilih titik melalui peta.";
  if (code === 2) return "Lokasi perangkat belum tersedia. Pilih titik melalui peta atau coba GPS lagi.";
  if (code === 3) return "Pencarian lokasi melewati batas waktu. Coba GPS lagi atau pilih titik di peta.";
  return "Lokasi perangkat tidak dapat diambil. Anda tetap dapat memilih titik melalui peta.";
}

/**
 * Mock laporan: buat (BE-10/BE-11), daftar & detail Operator (BE-12),
 * setujui (BE-13/BE-14), tolak (BE-15), cegah verifikasi ganda (BE-16).
 */
import { delay, http } from "msw";
import type {
  BuatLaporanResponse,
  JenisLaporan,
  JenisSampah,
  LaporanDetail,
  Laporan,
  Media,
  PilihanPoin,
  SetujuiLaporanResponse,
  StatusLaporan,
  Sumber,
  TolakLaporanResponse,
} from "../../types/api";
import { diDalamWilayah } from "../../lib/wilayah";
import { MAKS_JUDUL } from "../../lib/judul";
import {
  db,
  waktuSekarang,
  type LaporanMock,
  type LokasiMock,
  type MediaMock,
  type PenggunaMock,
} from "../db";
import {
  API,
  GagalMock,
  bacaAngka,
  bacaJson,
  idDariParam,
  jarakMeter,
  paginasi,
  sukses,
  suksesList,
  tanganiError,
  wajibLogin,
} from "../utils";

const SUMBER: readonly Sumber[] = ["PENGAMATAN_PRIBADI", "INFO_WARGA", "MEDIA_SOSIAL", "LAINNYA"];
const JENIS_SAMPAH: readonly JenisSampah[] = [
  "PLASTIK",
  "KEMASAN_STYROFOAM",
  "RUMAH_TANGGA",
  "ORGANIK",
  "LAINNYA",
];
const JENIS: readonly JenisLaporan[] = ["REPORTIT", "CLEANIT"];
const STATUS: readonly StatusLaporan[] = ["BELUM_DIPERIKSA", "VALID", "TIDAK_VALID"];
const PILIHAN_POIN: readonly PilihanPoin[] = [50, 100, 200];
const RADIUS_GABUNG_METER = 50;
const HARI = 24 * 60 * 60 * 1000;

function kosong(nilai: unknown): boolean {
  return nilai === undefined || nilai === null || (typeof nilai === "string" && nilai.trim() === "");
}

function keLaporan(l: LaporanMock): Laporan {
  return {
    idLaporan: l.idLaporan,
    jenis: l.jenis,
    judul: l.judul,
    lokasi: l.lokasi,
    latitude: l.latitude,
    longitude: l.longitude,
    waktu: l.waktu,
    createdAt: l.createdAt,
    sumber: l.sumber,
    jenisSampah: l.jenisSampah,
    status: l.status,
  };
}

function mediaLaporan(idLaporan: number): Media[] {
  return db.media
    .filter((m) => m.idLaporan === idLaporan)
    .map(({ idMedia, url, tipe, createdAt }) => ({ idMedia, url, tipe, createdAt }));
}

function cariLaporan(idLaporan: number): LaporanMock {
  const laporan = db.laporan.find((l) => l.idLaporan === idLaporan);
  if (!laporan) throw new GagalMock("NOT_FOUND");
  return laporan;
}

/** Lokasi TERCEMAR terdekat dalam radius 50 m (K13). */
function lokasiTerdekat(lat: number, lng: number): { lokasi: LokasiMock; jarak: number } | null {
  let terdekat: { lokasi: LokasiMock; jarak: number } | null = null;
  for (const lokasi of db.lokasi) {
    if (lokasi.status !== "TERCEMAR") continue;
    const jarak = jarakMeter(lat, lng, lokasi.latitude, lokasi.longitude);
    if (jarak <= RADIUS_GABUNG_METER && (!terdekat || jarak < terdekat.jarak)) {
      terdekat = { lokasi, jarak };
    }
  }
  return terdekat;
}

function keDetail(l: LaporanMock): LaporanDetail {
  const pelapor = db.pengguna.find((p) => p.id === l.idPelapor);
  const detail: LaporanDetail = {
    ...keLaporan(l),
    media: mediaLaporan(l.idLaporan),
    pelapor: { id: l.idPelapor, nama: pelapor?.nama ?? "-" },
    lokasiId: l.lokasiId,
    alasanPenolakan: l.alasanPenolakan,
    lokasiTerdekat: null,
    laporanAsal: null,
    pelaporAsalSama: null,
    jumlahBersihkanSendiri30Hari: null,
  };

  if (l.jenis === "REPORTIT" && l.status === "BELUM_DIPERIKSA") {
    const terdekat = lokasiTerdekat(l.latitude, l.longitude);
    if (terdekat) {
      detail.lokasiTerdekat = {
        idLokasi: terdekat.lokasi.idLokasi,
        nama: terdekat.lokasi.nama,
        jarakMeter: Math.round(terdekat.jarak),
      };
    }
  }

  if (l.jenis === "CLEANIT" && l.lokasiId !== null) {
    const lokasi = db.lokasi.find((x) => x.idLokasi === l.lokasiId);
    const asal = lokasi ? db.laporan.find((x) => x.idLaporan === lokasi.idLaporanAsal) : undefined;
    if (lokasi && asal) {
      detail.laporanAsal = {
        idLaporan: asal.idLaporan,
        judul: asal.judul,
        waktu: asal.waktu,
        media: mediaLaporan(asal.idLaporan),
      };
      detail.pelaporAsalSama = asal.idPelapor === l.idPelapor;
      const batas = Date.now() - 30 * HARI;
      detail.jumlahBersihkanSendiri30Hari = db.laporan.filter((x) => {
        if (x.jenis !== "CLEANIT" || x.idPelapor !== l.idPelapor || x.idLaporan === l.idLaporan) {
          return false;
        }
        const lok = db.lokasi.find((y) => y.idLokasi === x.lokasiId);
        const asalLok = lok ? db.laporan.find((y) => y.idLaporan === lok.idLaporanAsal) : undefined;
        return asalLok?.idPelapor === l.idPelapor && Date.parse(x.createdAt) >= batas;
      }).length;
    }
  }

  return detail;
}

/** Validasi `waktu`: ISO 8601 dan tidak di masa depan (BE-10). */
function cekWaktu(nilai: unknown, fields: Record<string, string>): number | null {
  if (typeof nilai !== "string" || Number.isNaN(Date.parse(nilai))) {
    fields.waktu = "Waktu harus berformat ISO 8601.";
    return null;
  }
  const waktu = Date.parse(nilai);
  if (waktu > Date.now()) {
    fields.waktu = "Waktu tidak boleh di masa depan.";
    return null;
  }
  return waktu;
}

/** Validasi 1–3 media milik pelapor yang belum tertaut ke laporan lain. */
function cekMedia(
  nilai: unknown,
  pelapor: PenggunaMock,
  fields: Record<string, string>,
): MediaMock[] {
  if (!Array.isArray(nilai) || nilai.length < 1 || nilai.length > 3) {
    fields.idMedia = "Unggah 1–3 foto atau video.";
    return [];
  }
  const media = nilai.map((id) => db.media.find((m) => m.idMedia === id));
  if (media.some((m) => !m || m.idPemilik !== pelapor.id)) {
    fields.idMedia = "Media tidak ditemukan.";
    return [];
  }
  // Simplifikasi mock untuk aturan CleanIt nomor 4: media yang sudah tertaut dianggap dipakai ulang.
  if (media.some((m) => m!.idLaporan !== null)) throw new GagalMock("MEDIA_SUDAH_DIGUNAKAN");
  return media.map((m) => m!);
}

function buatLaporan(
  body: Record<string, unknown>,
  pelapor: PenggunaMock,
): { laporan: LaporanMock; media: MediaMock[] } {
  const jenis = body.jenis;
  if (!JENIS.includes(jenis as JenisLaporan)) {
    throw new GagalMock("FORMAT_TIDAK_VALID", { jenis: "Jenis laporan tidak valid." });
  }

  const wajib = jenis === "REPORTIT"
    ? ["judul", "waktu", "lokasi", "latitude", "longitude", "sumber", "jenisSampah"]
    : ["judul", "waktu", "lokasiId"];
  const belumDiisi = Object.fromEntries(
    wajib.filter((f) => kosong(body[f])).map((f) => [f, "Wajib diisi."]),
  );
  if (Array.isArray(body.idMedia) && body.idMedia.length === 0) belumDiisi.idMedia = "Wajib diisi.";
  if (Object.keys(belumDiisi).length > 0) throw new GagalMock("DATA_TIDAK_LENGKAP", belumDiisi);

  const fields: Record<string, string> = {};
  const judul = typeof body.judul === "string" ? body.judul.trim() : "";
  if (judul.length < 1 || judul.length > MAKS_JUDUL) {
    fields.judul = `Judul harus 1–${MAKS_JUDUL} karakter.`;
  }
  const waktu = cekWaktu(body.waktu, fields);
  const media = cekMedia(body.idMedia, pelapor, fields);
  const sekarang = waktuSekarang();

  if (jenis === "REPORTIT") {
    const lokasiTeks = typeof body.lokasi === "string" ? body.lokasi.trim() : "";
    const lat = body.latitude;
    const lng = body.longitude;
    if (lokasiTeks.length > 255) fields.lokasi = "Lokasi maksimal 255 karakter.";
    if (typeof lat !== "number" || lat < -90 || lat > 90) fields.latitude = "Latitude tidak valid.";
    if (typeof lng !== "number" || lng < -180 || lng > 180) fields.longitude = "Longitude tidak valid.";
    if (!SUMBER.includes(body.sumber as Sumber)) fields.sumber = "Sumber tidak valid.";
    if (!JENIS_SAMPAH.includes(body.jenisSampah as JenisSampah)) {
      fields.jenisSampah = "Jenis sampah tidak valid.";
    }
    if (Object.keys(fields).length > 0) throw new GagalMock("FORMAT_TIDAK_VALID", fields);
    if (!diDalamWilayah(lat as number, lng as number)) throw new GagalMock("DI_LUAR_WILAYAH");

    const laporan: LaporanMock = {
      idLaporan: ++db.urutan.laporan,
      jenis: "REPORTIT",
      judul,
      lokasi: lokasiTeks,
      latitude: lat as number,
      longitude: lng as number,
      waktu: new Date(waktu!).toISOString().replace(/\.\d{3}Z$/, "Z"),
      createdAt: sekarang,
      sumber: body.sumber as Sumber,
      jenisSampah: body.jenisSampah as JenisSampah,
      status: "BELUM_DIPERIKSA",
      idPelapor: pelapor.id,
      lokasiId: null,
      alasanPenolakan: null,
      diverifikasiAt: null,
      poinDiberikan: null,
    };
    return { laporan, media };
  }

  // CLEANIT — Aturan CleanIt nomor 1–3.
  if (Object.keys(fields).length > 0) throw new GagalMock("FORMAT_TIDAK_VALID", fields);
  const lokasi = db.lokasi.find((l) => l.idLokasi === body.lokasiId);
  if (!lokasi) throw new GagalMock("NOT_FOUND");
  if (lokasi.status === "DIBERSIHKAN") throw new GagalMock("LOKASI_SUDAH_DIBERSIHKAN");
  const menunggu = db.laporan.some(
    (l) =>
      l.jenis === "CLEANIT" &&
      l.idPelapor === pelapor.id &&
      l.lokasiId === lokasi.idLokasi &&
      l.status === "BELUM_DIPERIKSA",
  );
  if (menunggu) throw new GagalMock("CLEANIT_SUDAH_MENUNGGU");
  const asal = db.laporan.find((l) => l.idLaporan === lokasi.idLaporanAsal);
  if (asal && waktu! < Date.parse(asal.waktu)) {
    throw new GagalMock("FORMAT_TIDAK_VALID", {
      waktu: "Waktu pembersihan tidak boleh sebelum waktu laporan asal.",
    });
  }

  const laporan: LaporanMock = {
    idLaporan: ++db.urutan.laporan,
    jenis: "CLEANIT",
    judul,
    lokasi: lokasi.nama,
    latitude: lokasi.latitude,
    longitude: lokasi.longitude,
    waktu: new Date(waktu!).toISOString().replace(/\.\d{3}Z$/, "Z"),
    createdAt: sekarang,
    sumber: null,
    jenisSampah: lokasi.jenisSampah,
    status: "BELUM_DIPERIKSA",
    idPelapor: pelapor.id,
    lokasiId: lokasi.idLokasi,
    alasanPenolakan: null,
    diverifikasiAt: null,
    poinDiberikan: null,
  };
  return { laporan, media };
}

function wajibBelumDiperiksa(laporan: LaporanMock): void {
  if (laporan.status !== "BELUM_DIPERIKSA") throw new GagalMock("SUDAH_DIVERIFIKASI");
}

export const laporanHandlers = [
  http.post(
    `${API}/laporan`,
    tanganiError(async ({ request }) => {
      await delay();
      const pelapor = wajibLogin(["MASYARAKAT"]);
      const { laporan, media } = buatLaporan(await bacaJson(request), pelapor);
      db.laporan.push(laporan);
      for (const m of media) m.idLaporan = laporan.idLaporan;
      const respons: BuatLaporanResponse = { idLaporan: laporan.idLaporan, status: "BELUM_DIPERIKSA" };
      return sukses(respons);
    }),
  ),

  http.get(
    `${API}/laporan`,
    tanganiError(async ({ request }) => {
      await delay();
      wajibLogin(["OPERATOR"]);
      const url = new URL(request.url);
      const jenis = url.searchParams.get("jenis");
      const status = url.searchParams.get("status") ?? "BELUM_DIPERIKSA";
      const sort = url.searchParams.get("sort") ?? "terbaru";
      if (jenis !== null && !JENIS.includes(jenis as JenisLaporan)) {
        throw new GagalMock("FORMAT_TIDAK_VALID", { jenis: "Jenis tidak valid." });
      }
      if (!STATUS.includes(status as StatusLaporan)) {
        throw new GagalMock("FORMAT_TIDAK_VALID", { status: "Status tidak valid." });
      }
      if (sort !== "terbaru" && sort !== "terlama") {
        throw new GagalMock("FORMAT_TIDAK_VALID", { sort: "Sort harus terbaru atau terlama." });
      }
      const page = bacaAngka(url.searchParams.get("page"), 1);
      const limit = bacaAngka(url.searchParams.get("limit"), 6);

      const hasil = db.laporan
        .filter((l) => (jenis === null || l.jenis === jenis) && l.status === status)
        .sort((a, b) => {
          const selisih = Date.parse(b.createdAt) - Date.parse(a.createdAt);
          return sort === "terbaru" ? selisih : -selisih;
        })
        .map(keLaporan);
      const { data, meta } = paginasi(hasil, page, limit);
      return suksesList(data, meta);
    }),
  ),

  http.get(
    `${API}/laporan/:id`,
    tanganiError(async ({ params }) => {
      await delay();
      wajibLogin(["OPERATOR"]);
      return sukses(keDetail(cariLaporan(idDariParam(params.id))));
    }),
  ),

  http.post(
    `${API}/laporan/:id/setujui`,
    tanganiError(async ({ params, request }) => {
      await delay();
      wajibLogin(["OPERATOR"]);
      const laporan = cariLaporan(idDariParam(params.id));
      const body = await bacaJson(request);
      wajibBelumDiperiksa(laporan);
      const sekarang = waktuSekarang();

      if (laporan.jenis === "REPORTIT") {
        const poin = body.poin ?? 50;
        if (!PILIHAN_POIN.includes(poin as PilihanPoin)) {
          throw new GagalMock("FORMAT_TIDAK_VALID", { poin: "Poin harus 50, 100, atau 200." });
        }
        const namaLokasi =
          typeof body.namaLokasi === "string" && body.namaLokasi.trim()
            ? body.namaLokasi.trim()
            : laporan.lokasi;
        if (namaLokasi.length > 255) {
          throw new GagalMock("FORMAT_TIDAK_VALID", { namaLokasi: "Nama lokasi maksimal 255 karakter." });
        }

        const terdekat = lokasiTerdekat(laporan.latitude, laporan.longitude);
        let lokasi: LokasiMock;
        if (terdekat) {
          // K13: digabung ke lokasi yang ada; poin dan nama dari Operator diabaikan.
          lokasi = terdekat.lokasi;
        } else {
          lokasi = {
            idLokasi: ++db.urutan.lokasi,
            nama: namaLokasi,
            alamat: laporan.lokasi,
            latitude: laporan.latitude,
            longitude: laporan.longitude,
            jenisSampah: laporan.jenisSampah,
            status: "TERCEMAR",
            poin: poin as PilihanPoin,
            dilaporkanAt: laporan.createdAt,
            idLaporanAsal: laporan.idLaporan,
          };
          db.lokasi.push(lokasi);
        }
        Object.assign(laporan, { status: "VALID", lokasiId: lokasi.idLokasi, diverifikasiAt: sekarang });
        const respons: SetujuiLaporanResponse = {
          idLaporan: laporan.idLaporan,
          status: "VALID",
          idLokasi: lokasi.idLokasi,
          digabung: terdekat !== null,
        };
        return sukses(respons);
      }

      // CLEANIT (BE-14, K12)
      const lokasi = db.lokasi.find((l) => l.idLokasi === laporan.lokasiId);
      if (!lokasi) throw new GagalMock("NOT_FOUND");
      if (lokasi.status !== "TERCEMAR") throw new GagalMock("LOKASI_SUDAH_DIBERSIHKAN");
      lokasi.status = "DIBERSIHKAN";
      const pelapor = db.pengguna.find((p) => p.id === laporan.idPelapor);
      if (pelapor) pelapor.saldoPoin += lokasi.poin;
      Object.assign(laporan, { status: "VALID", diverifikasiAt: sekarang, poinDiberikan: lokasi.poin });
      for (const lain of db.laporan) {
        if (lain.jenis === "CLEANIT" && lain.lokasiId === lokasi.idLokasi && lain.status === "BELUM_DIPERIKSA") {
          Object.assign(lain, {
            status: "TIDAK_VALID",
            alasanPenolakan: "Lokasi sudah dibersihkan",
            diverifikasiAt: sekarang,
          });
        }
      }
      const respons: SetujuiLaporanResponse = {
        idLaporan: laporan.idLaporan,
        status: "VALID",
        poinDiberikan: lokasi.poin,
      };
      return sukses(respons);
    }),
  ),

  http.post(
    `${API}/laporan/:id/tolak`,
    tanganiError(async ({ params, request }) => {
      await delay();
      wajibLogin(["OPERATOR"]);
      const laporan = cariLaporan(idDariParam(params.id));
      const body = await bacaJson(request);
      wajibBelumDiperiksa(laporan);
      const alasan = typeof body.alasan === "string" ? body.alasan.trim() : "";
      if (laporan.jenis === "CLEANIT" && !alasan) {
        throw new GagalMock("DATA_TIDAK_LENGKAP", { alasan: "Alasan penolakan wajib diisi untuk CleanIt." });
      }
      Object.assign(laporan, {
        status: "TIDAK_VALID",
        alasanPenolakan: alasan || null,
        diverifikasiAt: waktuSekarang(),
      });
      const respons: TolakLaporanResponse = { idLaporan: laporan.idLaporan, status: "TIDAK_VALID" };
      return sukses(respons);
    }),
  ),
];

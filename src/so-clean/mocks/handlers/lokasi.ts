/** Mock lokasi (BE-17, UC04, I-09/I-10). */
import { delay, http } from "msw";
import type { Lokasi, LokasiDetail, StatusLokasi } from "../../types/api";
import { db, type LokasiMock } from "../db";
import { API, GagalMock, idDariParam, sukses, tanganiError, wajibLogin } from "../utils";

const STATUS: readonly StatusLokasi[] = ["TERCEMAR", "DIBERSIHKAN"];

function keLokasi(l: LokasiMock): Lokasi {
  return {
    idLokasi: l.idLokasi,
    nama: l.nama,
    alamat: l.alamat,
    latitude: l.latitude,
    longitude: l.longitude,
    jenisSampah: l.jenisSampah,
    status: l.status,
    poin: l.poin,
    dilaporkanAt: l.dilaporkanAt,
  };
}

export const lokasiHandlers = [
  http.get(
    `${API}/lokasi`,
    tanganiError(async ({ request }) => {
      await delay();
      wajibLogin();
      const status = new URL(request.url).searchParams.get("status") ?? "TERCEMAR";
      if (!STATUS.includes(status as StatusLokasi)) {
        throw new GagalMock("FORMAT_TIDAK_VALID", { status: "Status tidak valid." });
      }
      // Tanpa filter radius (N11).
      const data = db.lokasi
        .filter((l) => l.status === status)
        .sort((a, b) => Date.parse(b.dilaporkanAt) - Date.parse(a.dilaporkanAt))
        .map(keLokasi);
      return sukses(data);
    }),
  ),

  http.get(
    `${API}/lokasi/:id`,
    tanganiError(async ({ params }) => {
      await delay();
      wajibLogin();
      const id = idDariParam(params.id);
      const lokasi = db.lokasi.find((l) => l.idLokasi === id);
      const asal = lokasi ? db.laporan.find((l) => l.idLaporan === lokasi.idLaporanAsal) : undefined;
      if (!lokasi || !asal || asal.sumber === null) throw new GagalMock("NOT_FOUND");

      const detail: LokasiDetail = {
        ...keLokasi(lokasi),
        laporanAsal: {
          idLaporan: asal.idLaporan,
          judul: asal.judul,
          waktu: asal.waktu,
          sumber: asal.sumber,
          media: db.media
            .filter((m) => m.idLaporan === asal.idLaporan)
            .map(({ idMedia, url, tipe, createdAt }) => ({ idMedia, url, tipe, createdAt })),
        },
      };
      return sukses(detail);
    }),
  ),
];

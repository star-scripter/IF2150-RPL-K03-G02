import type { LokasiDetail, StatusLokasi } from "@/types/api";
import { LOKASI_UJI_FE14 } from "./lokasi";

/** Lokasi dan bukti fiktif untuk kontrak FE-16/BE-17. */
export function detailLokasiUji(idLokasi = 32, status: StatusLokasi = "TERCEMAR"): LokasiDetail {
  const lokasi = LOKASI_UJI_FE14.find((item) => item.idLokasi === idLokasi) ?? LOKASI_UJI_FE14[1];
  return {
    ...lokasi, idLokasi, status,
    laporanAsal: {
      idLaporan: idLokasi + 100,
      judul: `Sampah di ${lokasi.nama}`,
      waktu: "2026-11-10T02:15:00.000Z",
      sumber: "PENGAMATAN_PRIBADI",
      media: [
        { idMedia: idLokasi * 10 + 1, tipe: "FOTO", url: `https://media.example.test/foto-${idLokasi}.png`, createdAt: "2026-11-10T02:30:00.000Z" },
        { idMedia: idLokasi * 10 + 2, tipe: "VIDEO", url: `https://media.example.test/video-${idLokasi}.mp4`, createdAt: "2026-11-10T02:31:00.000Z" },
      ],
    },
  };
}

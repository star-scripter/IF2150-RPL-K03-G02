/** Mock notifikasi, diturunkan dari laporan yang sudah diverifikasi (BE-23). */
import { delay, http } from "msw";
import type { Notifikasi } from "../../types/api";
import { db, waktuSekarang } from "../db";
import { API, sukses, tanganiError, wajibLogin } from "../utils";

export const notifikasiHandlers = [
  http.get(
    `${API}/notifikasi`,
    tanganiError(async () => {
      await delay();
      const pengguna = wajibLogin(["MASYARAKAT"]);
      const dilihat = pengguna.notifikasiDilihatAt ? Date.parse(pengguna.notifikasiDilihatAt) : null;

      const data: Notifikasi[] = db.laporan
        .filter((l) => l.idPelapor === pengguna.id && l.status !== "BELUM_DIPERIKSA" && l.diverifikasiAt)
        .map((l) => ({
          idLaporan: l.idLaporan,
          jenis: l.jenis,
          judul: l.judul,
          status: l.status as Notifikasi["status"],
          alasanPenolakan: l.alasanPenolakan,
          // Hanya CleanIt yang VALID mendapat poin (N1).
          poinDiberikan: l.jenis === "CLEANIT" && l.status === "VALID" ? l.poinDiberikan : null,
          waktu: l.diverifikasiAt!,
          dibaca: dilihat !== null && Date.parse(l.diverifikasiAt!) <= dilihat,
        }))
        .sort((a, b) => Date.parse(b.waktu) - Date.parse(a.waktu));
      return sukses(data);
    }),
  ),

  http.post(
    `${API}/notifikasi/dibaca`,
    tanganiError(async () => {
      const pengguna = wajibLogin(["MASYARAKAT"]);
      pengguna.notifikasiDilihatAt = waktuSekarang();
      return sukses({ ok: true as const });
    }),
  ),
];

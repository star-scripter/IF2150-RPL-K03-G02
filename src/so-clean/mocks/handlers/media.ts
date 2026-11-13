/** Mock upload media (BE-07/BE-08, UC02). */
import { delay, http } from "msw";
import type { MediaUploadResponse, TipeMedia } from "../../types/api";
import { db, gambarDummy, waktuSekarang } from "../db";
import { API, GagalMock, sukses, tanganiError, wajibLogin } from "../utils";

const MAKS_UKURAN = 20 * 1024 * 1024;

const TIPE_DIDUKUNG: Record<string, TipeMedia> = {
  "image/jpeg": "FOTO",
  "image/png": "FOTO",
  "video/mp4": "VIDEO",
};

/** Di browser, file yang diunggah langsung bisa dipratinjau lewat object URL. */
function urlPratinjau(file: File, tipe: TipeMedia): string {
  try {
    if (typeof URL.createObjectURL === "function") return URL.createObjectURL(file);
  } catch {
    // Lingkungan tanpa object URL: pakai placeholder.
  }
  return gambarDummy(tipe === "VIDEO" ? "Video" : "Foto");
}

export const mediaHandlers = [
  http.post(
    `${API}/media`,
    tanganiError(async ({ request }) => {
      const pengguna = wajibLogin(["MASYARAKAT"]);

      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        throw new GagalMock("FORMAT_TIDAK_VALID", { file: "Kirim file sebagai multipart/form-data." });
      }
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) {
        throw new GagalMock("DATA_TIDAK_LENGKAP", { file: "File wajib diisi." });
      }

      const tipe = TIPE_DIDUKUNG[file.type];
      if (!tipe) throw new GagalMock("TIPE_FILE_TIDAK_DIDUKUNG");
      if (file.size > MAKS_UKURAN) throw new GagalMock("FILE_TERLALU_BESAR");

      // Simulasi waktu unggah.
      await delay(600);

      const idMedia = ++db.urutan.media;
      const url = urlPratinjau(file, tipe);
      db.media.push({
        idMedia,
        url,
        tipe,
        createdAt: waktuSekarang(),
        idPemilik: pengguna.id,
        idLaporan: null,
      });

      const respons: MediaUploadResponse = { idMedia, url, tipe };
      return sukses(respons);
    }),
  ),
];

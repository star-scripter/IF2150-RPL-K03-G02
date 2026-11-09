/** Controller media — validasi, hash, pemrosesan bukti, dan upload (UC02). */
import { createHash } from "node:crypto";
import { z } from "zod";
import { ApiError, apiSuccess, parseFormData } from "@/server/api";
import type { Sesi } from "@/server/auth/guard";
import * as MediaModel from "@/server/models/media";
import {
  MAKS_UKURAN_MEDIA_BYTE,
  prosesMediaAsli,
  validasiTipeMedia,
} from "@/server/media/processing";
import { getUrl, upload } from "@/server/storage/s3";
import type { MediaUploadResponse } from "@/types/api";

const formSchema = z.strictObject({ file: z.instanceof(File) });

/** POST /api/media: persist original-file hash and upload only the processed media bytes. */
export async function unggahMedia(request: Request, sesi: Sesi): Promise<Response> {
  const { file } = await parseFormData(request, formSchema, { requiredFields: ["file"] });

  if (file.size > MAKS_UKURAN_MEDIA_BYTE) {
    throw new ApiError("FILE_TERLALU_BESAR", "Ukuran file maksimal 20 MB.");
  }
  if (file.size === 0) {
    throw new ApiError("FORMAT_TIDAK_VALID", "File tidak boleh kosong.", { file: "File tidak boleh kosong." });
  }

  const original = Buffer.from(await file.arrayBuffer());
  const contentType = validasiTipeMedia(original, file.type.toLowerCase());
  // Hash wajib atas byte asli dan dicek sebelum watermark maupun upload.
  const sha256 = createHash("sha256").update(original).digest("hex");
  if (await MediaModel.sudahDipakai(sha256)) {
    throw new ApiError("MEDIA_SUDAH_DIGUNAKAN", "Foto atau video ini sudah pernah dipakai di laporan lain.");
  }

  const createdAt = new Date();
  const processed = await prosesMediaAsli(original, contentType, createdAt);
  const bodyBytes = new Uint8Array(processed.buffer.length);
  bodyBytes.set(processed.buffer);
  const body = new Blob([bodyBytes], { type: processed.contentType });
  const storageKey = await upload(body);
  const idMedia = await MediaModel.buatMedia({
    idPengguna: sesi.idPengguna,
    storageKey,
    tipe: processed.tipe,
    ukuranByte: file.size,
    sha256,
    createdAt,
  });
  const url = await getUrl(storageKey);

  const result: MediaUploadResponse = { idMedia, url, tipe: processed.tipe };
  return apiSuccess(result, 201);
}

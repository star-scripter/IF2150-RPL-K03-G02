// POST /api/media — unggah satu bukti milik Masyarakat.
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { unggahMedia } from "@/server/controllers/media";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/media", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return unggahMedia(request, sesi);
  });
}

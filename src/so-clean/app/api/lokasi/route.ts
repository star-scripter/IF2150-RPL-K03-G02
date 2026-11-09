// GET /api/lokasi — UC04, I-09/I-10 (Login)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { get_daftar_lokasi } from "@/server/controllers/manager-laporan";

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/lokasi", async () => {
    await wajibLogin(request);
    return get_daftar_lokasi(request);
  });
}

// GET /api/notifikasi — C08 notify, diturunkan dari laporan terverifikasi (Masyarakat)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { getNotifikasi } from "@/server/controllers/manager-laporan";

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/notifikasi", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return getNotifikasi(sesi);
  });
}

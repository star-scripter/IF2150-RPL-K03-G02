// POST /api/laporan — pembuatan ReportIt/CleanIt oleh Masyarakat (UC01/UC05).
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { buat_laporan } from "@/server/controllers/manager-laporan";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/laporan", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return buat_laporan(request, sesi);
  });
}

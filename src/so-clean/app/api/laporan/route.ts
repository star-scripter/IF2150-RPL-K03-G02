// /api/laporan
//   POST: pembuatan ReportIt/CleanIt oleh Masyarakat (UC01/UC05).
//   GET : daftar laporan untuk Operator (UC03/UC06, I-07).
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { buat_laporan, get_all_laporan_unverified } from "@/server/controllers/manager-laporan";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/laporan", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return buat_laporan(request, sesi);
  });
}

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/laporan", async () => {
    await wajibLogin(request, ["OPERATOR"]);
    return get_all_laporan_unverified(request);
  });
}

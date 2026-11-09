// /api/penukaran — UC09 (Masyarakat)
//   POST: C16 tukarPoin
//   GET : riwayat penukaran (N13)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { getRiwayatPenukaran, tukarPoin } from "@/server/controllers/penukaran";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/penukaran", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return tukarPoin(request, sesi);
  });
}

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/penukaran", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return getRiwayatPenukaran(request, sesi);
  });
}

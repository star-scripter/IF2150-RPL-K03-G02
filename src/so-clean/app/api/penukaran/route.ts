// POST /api/penukaran — UC09, C16 tukarPoin (Masyarakat)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { tukarPoin } from "@/server/controllers/penukaran";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/penukaran", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return tukarPoin(request, sesi);
  });
}

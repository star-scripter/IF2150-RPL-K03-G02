// GET /api/poin/saldo — UC07, C11 lihatSaldo (Masyarakat)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { lihatSaldo } from "@/server/controllers/manager-poin";

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/poin/saldo", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return lihatSaldo(sesi);
  });
}

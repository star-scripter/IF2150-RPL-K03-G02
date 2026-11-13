// GET /api/reward — UC08, C11 lihatRewardTersedia (Login)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { lihatRewardTersedia } from "@/server/controllers/manager-poin";

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/reward", async () => {
    await wajibLogin(request);
    return lihatRewardTersedia();
  });
}

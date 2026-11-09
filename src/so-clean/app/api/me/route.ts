import { handleApiRequest } from "@/server/api/handler";
import { requireSessionCookie } from "@/server/auth/session-cookie";
import { getProfil } from "@/server/controllers/auth";

export function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/me", async () => {
    const session = await requireSessionCookie();
    return getProfil(session.idPengguna);
  });
}

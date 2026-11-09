import { handleApiRequest } from "@/server/api/handler";
import { requireSessionCookie } from "@/server/auth/session-cookie";
import { logout } from "@/server/controllers/auth";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/auth/logout", async () => {
    await requireSessionCookie();
    return logout();
  });
}

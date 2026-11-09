import { handleApiRequest } from "@/server/api/handler";
import { login } from "@/server/controllers/auth";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/auth/login", () => login(request));
}

import { handleApiRequest } from "@/server/api/handler";
import { register } from "@/server/controllers/auth";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/auth/register", () => register(request));
}

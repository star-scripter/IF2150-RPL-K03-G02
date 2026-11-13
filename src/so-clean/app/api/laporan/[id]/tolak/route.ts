// POST /api/laporan/:id/tolak — C05 tolak (Operator)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { tolak } from "@/server/controllers/validator-laporan";

export function POST(request: Request, { params }: RouteContext<"/api/laporan/[id]/tolak">) {
  return handleApiRequest(request, "/api/laporan/[id]/tolak", async () => {
    const sesi = await wajibLogin(request, ["OPERATOR"]);
    const { id } = await params;
    return tolak(request, id, sesi);
  });
}

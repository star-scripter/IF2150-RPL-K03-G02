// GET /api/laporan/:id — detail laporan untuk Operator (I-08, C05 get_detail)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { get_detail } from "@/server/controllers/validator-laporan";

export function GET(request: Request, { params }: RouteContext<"/api/laporan/[id]">) {
  return handleApiRequest(request, "/api/laporan/[id]", async () => {
    await wajibLogin(request, ["OPERATOR"]);
    const { id } = await params;
    return get_detail(id);
  });
}

// POST /api/laporan/:id/setujui — C05 setujui (Operator)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { setujui } from "@/server/controllers/validator-laporan";

export function POST(request: Request, { params }: RouteContext<"/api/laporan/[id]/setujui">) {
  return handleApiRequest(request, "/api/laporan/[id]/setujui", async () => {
    const sesi = await wajibLogin(request, ["OPERATOR"]);
    const { id } = await params;
    return setujui(request, id, sesi);
  });
}

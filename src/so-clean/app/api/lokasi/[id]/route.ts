// GET /api/lokasi/:id — UC04, C06 get_lokasi (Login)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { get_detail_lokasi } from "@/server/controllers/manager-laporan";

export function GET(request: Request, { params }: RouteContext<"/api/lokasi/[id]">) {
  return handleApiRequest(request, "/api/lokasi/[id]", async () => {
    await wajibLogin(request);
    const { id } = await params;
    return get_detail_lokasi(id);
  });
}

// POST /api/notifikasi/dibaca — tandai semua notifikasi dibaca (Masyarakat)
import { handleApiRequest } from "@/server/api";
import { wajibLogin } from "@/server/auth/guard";
import { tandaiNotifikasiDibaca } from "@/server/controllers/manager-laporan";

export function POST(request: Request): Promise<Response> {
  return handleApiRequest(request, "/api/notifikasi/dibaca", async () => {
    const sesi = await wajibLogin(request, ["MASYARAKAT"]);
    return tandaiNotifikasiDibaca(sesi);
  });
}

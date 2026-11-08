/**
 * TEMPLATE CONTROLLER — contoh memakai endpoint Reward (UC08).
 *
 * Cara pakai:
 * 1. Salin file ini dan beri nama sesuai kelas controller DPPL dalam kebab-case,
 *    mis. `manager-laporan.ts` (C15), `validator-laporan.ts` (C05), `manager-poin.ts` (C11),
 *    `penukaran.ts` (C16).
 * 2. Satu fungsi controller = satu endpoint. Panggil dari route handler `app/api/**\/route.ts`;
 *    route handler cukup meneruskan request, tanpa logika:
 *
 *      // app/api/reward/[id]/route.ts
 *      import { getDetailReward } from "@/server/controllers/reward";
 *
 *      export async function GET(_req: Request, { params }: RouteContext<"/api/reward/[id]">) {
 *        const { id } = await params; // di Next.js 16, params berupa Promise
 *        return getDetailReward(id);
 *      }
 *
 * Tanggung jawab controller:
 * - Validasi input dari request (field wajib, format). Cek sesi/role dilakukan
 *   di route handler sesuai BE-06.
 * - Memanggil satu atau beberapa model; transaksi multi-tabel dibuka di sini
 *   (`db.transaction`). Controller boleh mengimpor `db` hanya untuk membuka
 *   transaksi, lalu meneruskan `tx` ke model.
 * - Mengubah hasil model menjadi respons sesuai kontrak:
 *     sukses → `{ data }` (+ `meta` untuk list)
 *     gagal  → `{ error: { code, message, fields? } }` dengan kode dari tabel "Kode error".
 * - Tidak menulis query database langsung (`db.select/insert/update/delete`
 *   atau SQL); itu tugas model.
 *
 * Kelas DPPL: Cxx - <NamaKelas>
 */
import * as RewardModel from "@/server/models/_template";

// TODO(BE-04): pindahkan helper respons ini ke modul bersama agar tidak disalin di tiap controller.
function sukses<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

function gagal(status: number, code: string, message: string, fields?: Record<string, string>) {
  return Response.json({ error: { code, message, ...(fields && { fields }) } }, { status });
}

/** GET /api/reward — UC08, C09 getRewardTersedia() */
export async function getDaftarReward(): Promise<Response> {
  // Route handler menerapkan cek akses sesuai BE-06 sebelum memanggil controller.
  const daftar = await RewardModel.getRewardTersedia();
  return sukses(daftar);
}

/** GET /api/reward/:id — C09 cariReward(idReward) */
export async function getDetailReward(idParam: string): Promise<Response> {
  const idReward = Number(idParam);
  if (!Number.isInteger(idReward) || idReward <= 0) {
    return gagal(400, "FORMAT_TIDAK_VALID", "ID reward tidak valid.", {
      id: "Harus bilangan bulat positif.",
    });
  }

  const reward = await RewardModel.cariReward(idReward);
  if (!reward) {
    return gagal(404, "NOT_FOUND", "Reward tidak ditemukan.");
  }

  return sukses(reward);
}

/**
 * Controller Penukaran — menukar poin dengan reward (UC09).
 *
 * `tukarPoin` mengikuti Algo-001: pemeriksaan reward, stok, dan saldo dilakukan sebelum
 * transaksi, lalu pengurangan saldo, pengurangan stok, dan pencatatan penukaran berjalan dalam
 * satu transaksi (BEGIN/COMMIT/ROLLBACK). Query dijalankan model; controller hanya membuka batas
 * transaksi. UPDATE saldo dan stok bersyarat, jadi penukaran bersamaan yang lolos pemeriksaan
 * awal tetap ditolak di dalam transaksi dan semua perubahannya di-rollback.
 *
 * Kelas DPPL: C16 - Penukaran (Controller)
 */
import { z } from "zod";
import { ApiError, apiList, apiSuccess, parseJsonBody, parseQuery } from "@/server/api";
import type { Sesi } from "@/server/auth/guard";
import { db } from "@/server/db";
import * as ManagerPoin from "@/server/controllers/manager-poin";
import * as PenukaranModel from "@/server/models/penukaran";
import * as RewardModel from "@/server/models/reward";
import type { TukarPoinResponse } from "@/types/api";

const tukarPoinSchema = z.object({
  // Batas kolom serial (int4).
  idReward: z.number().int().positive().max(2_147_483_647),
});

/** Default `limit` sama dengan mock FE-04; batas atas mencegah satu request mengambil semua. */
export const LIMIT_RIWAYAT_DEFAULT = 10;
export const LIMIT_RIWAYAT_MAKS = 50;

const riwayatQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(LIMIT_RIWAYAT_MAKS).default(LIMIT_RIWAYAT_DEFAULT),
});

const pesanStokHabis = "Stok reward sudah habis.";
const pesanPoinTidakCukup = "Poin tidak cukup untuk menukar reward ini.";

/** POST /api/penukaran — tukarPoin(pengguna, idReward), Algo-001. */
export async function tukarPoin(request: Request, sesi: Sesi): Promise<Response> {
  const { idReward } = await parseJsonBody(request, tukarPoinSchema);

  const reward = await RewardModel.cariReward(idReward);
  if (!reward) {
    throw new ApiError("NOT_FOUND", "Reward tidak ditemukan.");
  }
  if (!RewardModel.tersedia(reward)) {
    throw new ApiError("STOK_HABIS", pesanStokHabis);
  }
  if (!(await ManagerPoin.cekPoin(sesi.idPengguna, reward.hargaPoin))) {
    throw new ApiError("POIN_TIDAK_CUKUP", pesanPoinTidakCukup);
  }

  // Error yang dilempar di dalam callback membuat Drizzle menjalankan ROLLBACK.
  const hasil = await db.transaction(async (tx): Promise<TukarPoinResponse> => {
    const sisaPoin = await ManagerPoin.kurangiPoin(sesi.idPengguna, reward.hargaPoin, tx);
    if (sisaPoin === null) {
      throw new ApiError("POIN_TIDAK_CUKUP", pesanPoinTidakCukup);
    }

    const sisaStok = await RewardModel.kurangiStok(reward.idReward, tx);
    if (sisaStok === null) {
      throw new ApiError("STOK_HABIS", pesanStokHabis);
    }

    const penukaran = await PenukaranModel.buatPenukaran(sesi.idPengguna, reward, tx);
    return { ...penukaran, sisaPoin };
  });

  return apiSuccess(hasil, 201);
}

/** GET /api/penukaran — riwayat penukaran milik pengguna yang login (N13), dengan pagination. */
export async function getRiwayatPenukaran(request: Request, sesi: Sesi): Promise<Response> {
  const { page, limit } = await parseQuery(request, riwayatQuerySchema);
  const { data, total } = await PenukaranModel.getRiwayat(sesi.idPengguna, page, limit);
  return apiList(data, { page, limit, total });
}

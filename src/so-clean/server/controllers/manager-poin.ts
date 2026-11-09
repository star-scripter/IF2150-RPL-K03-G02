/**
 * Controller ManagerPoin — saldo poin pengguna (UC07) dan katalog reward (UC08).
 *
 * Endpoint poin dan reward melewati ManagerPoin, bukan memanggil model langsung dari route
 * handler. Cek sesi/role dilakukan di route handler; fungsi di sini menerima sesi yang sudah
 * diverifikasi.
 *
 * Kelas DPPL: C11 - ManagerPoin
 */
import { ApiError, apiSuccess } from "@/server/api";
import type { Sesi } from "@/server/auth/guard";
import * as PenggunaModel from "@/server/models/pengguna";
import * as RewardModel from "@/server/models/reward";
import type { SaldoPoinResponse } from "@/types/api";

/** GET /api/poin/saldo — lihatSaldo(pengguna), Algo-002. Saldo dibaca dari database. */
export async function lihatSaldo(sesi: Sesi): Promise<Response> {
  const saldoPoin = await PenggunaModel.getSaldoPoin(sesi.idPengguna);
  if (saldoPoin === null) {
    // Cookie valid, tetapi akunnya sudah tidak ada.
    throw new ApiError("UNAUTHORIZED", "Sesi tidak valid. Silakan login kembali.");
  }

  const data: SaldoPoinResponse = { saldoPoin };
  return apiSuccess(data);
}

/**
 * GET /api/reward — lihatRewardTersedia(), Algo-003 (dipanggil DaftarReward C10).
 * Semua reward dikembalikan, termasuk stok 0 (N3).
 */
export async function lihatRewardTersedia(): Promise<Response> {
  const daftar = await RewardModel.getRewardTersedia();
  return apiSuccess(daftar);
}

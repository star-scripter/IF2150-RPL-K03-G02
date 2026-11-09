/**
 * Controller ManagerPoin — saldo poin pengguna (UC07) dan katalog reward (UC08).
 *
 * Endpoint poin dan reward melewati ManagerPoin, bukan memanggil model langsung dari route
 * handler. Cek sesi/role dilakukan di route handler; fungsi di sini menerima sesi yang sudah
 * diverifikasi. `cekPoin` dan `kurangiPoin` bukan endpoint, melainkan dipakai controller
 * Penukaran (C16) sesuai Algo-001 `tukarPoin`.
 *
 * Kelas DPPL: C11 - ManagerPoin
 */
import { ApiError, apiSuccess } from "@/server/api";
import type { Sesi } from "@/server/auth/guard";
import type { Db } from "@/server/db";
import * as PenggunaModel from "@/server/models/pengguna";
import * as RewardModel from "@/server/models/reward";
import type { SaldoPoinResponse } from "@/types/api";

/** Transaksi yang dibuka controller dengan `db.transaction(...)`. */
type Transaksi = Parameters<Parameters<Db["transaction"]>[0]>[0];

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

/** cekPoin(pengguna, harga) — Algo-005: true jika saldo pengguna mencukupi harga. */
export async function cekPoin(idPengguna: string, harga: number, tx?: Transaksi): Promise<boolean> {
  if (harga < 0) return false;
  return PenggunaModel.cukupPoin(idPengguna, harga, tx);
}

/**
 * kurangiPoin(pengguna, jumlah) — Algo-004, dipanggil di dalam transaksi penukaran. Mengembalikan
 * saldo baru, atau `null` jika saldo tidak cukup. Pengurangan di model memakai UPDATE bersyarat,
 * jadi tetap aman walaupun saldo berubah setelah `cekPoin`.
 */
export async function kurangiPoin(
  idPengguna: string,
  jumlah: number,
  tx: Transaksi,
): Promise<number | null> {
  if (jumlah <= 0) return null;
  if (!(await cekPoin(idPengguna, jumlah, tx))) return null;
  return PenggunaModel.kurangiPoin(idPengguna, jumlah, tx);
}

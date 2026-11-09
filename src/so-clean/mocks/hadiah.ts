/**
 * Mock sementara GET /api/poin/saldo dan GET /api/reward selama BE-19, BE-20, dan API client
 * FE-04 belum tersedia. Bentuk respons mengikuti kontrak ({ data } / { error }).
 * Skenario uji dipilih lewat query: /hadiah?mock=kosong atau /hadiah?mock=error.
 *
 * TODO(FE-04): hapus file ini dan panggil endpoint lewat API client FE-04.
 */
import type { ApiResult, Reward, SaldoPoinResponse } from "@/types/api";

export type SkenarioMock = "normal" | "kosong" | "error";

const SALDO: SaldoPoinResponse = { saldoPoin: 120 };

// Urutan meniru respons BE-20 (N3): stok > 0 dulu, lalu harga naik.
const DAFTAR_REWARD: Reward[] = [
  { idReward: 1, nama: "Voucher Kopi Rp25.000", jenis: "VOUCHER", hargaPoin: 50, stok: 20 },
  { idReward: 2, nama: "Tumbler SoClean", jenis: "MERCHANDISE", hargaPoin: 100, stok: 9 },
  { idReward: 4, nama: "Donasi 5 Bibit Mangrove", jenis: "DONASI", hargaPoin: 200, stok: 15 },
  { idReward: 5, nama: "Voucher Belanja Rp100.000", jenis: "VOUCHER", hargaPoin: 200, stok: 5 },
  { idReward: 3, nama: "Tote Bag Daur Ulang", jenis: "MERCHANDISE", hargaPoin: 100, stok: 0 },
];

const GAGAL = {
  error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server. Coba lagi nanti." },
} as const;

const tunda = () => new Promise((selesai) => setTimeout(selesai, 400));

export function bacaSkenarioMock(): SkenarioMock {
  const nilai = new URLSearchParams(window.location.search).get("mock");
  return nilai === "kosong" || nilai === "error" ? nilai : "normal";
}

export async function muatSaldoMock(skenario: SkenarioMock): Promise<ApiResult<SaldoPoinResponse>> {
  await tunda();
  return skenario === "error" ? GAGAL : { data: SALDO };
}

export async function muatRewardMock(skenario: SkenarioMock): Promise<ApiResult<Reward[]>> {
  await tunda();
  if (skenario === "error") return GAGAL;
  return { data: skenario === "kosong" ? [] : DAFTAR_REWARD };
}

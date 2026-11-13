import type { Reward } from "@/types/api";

export type StatusTombolReward =
  | { status: "TUKAR" }
  | { status: "KURANG"; selisih: number }
  | { status: "HABIS" };

// N3: stok 0 selalu "Habis" walaupun saldo cukup; selisih hanya untuk reward yang masih ada stok.
export function statusTombolReward(
  reward: Pick<Reward, "hargaPoin" | "stok">,
  saldoPoin: number,
): StatusTombolReward {
  if (reward.stok <= 0) return { status: "HABIS" };
  if (saldoPoin < reward.hargaPoin) {
    return { status: "KURANG", selisih: reward.hargaPoin - saldoPoin };
  }
  return { status: "TUKAR" };
}

export const WARNA_JENIS: Record<string, string> = {
  VOUCHER: "bg-sky-blue",
  DONASI: "bg-emerald",
  MERCHANDISE: "bg-emerald",
};

export function labelJenis(jenis: string) {
  return jenis.charAt(0) + jenis.slice(1).toLowerCase();
}

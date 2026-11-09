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

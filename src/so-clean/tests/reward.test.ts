import { describe, expect, it } from "vitest";
import { statusTombolReward } from "../lib/reward";

describe("statusTombolReward", () => {
  it("Tukar jika stok ada dan saldo cukup", () => {
    expect(statusTombolReward({ hargaPoin: 50, stok: 3 }, 120)).toEqual({ status: "TUKAR" });
  });

  it("Tukar jika saldo tepat sama dengan harga", () => {
    expect(statusTombolReward({ hargaPoin: 100, stok: 1 }, 100)).toEqual({ status: "TUKAR" });
  });

  it("Kurang dengan selisih jika saldo kurang", () => {
    expect(statusTombolReward({ hargaPoin: 200, stok: 5 }, 120)).toEqual({
      status: "KURANG",
      selisih: 80,
    });
  });

  it("Habis jika stok 0 walaupun saldo cukup", () => {
    expect(statusTombolReward({ hargaPoin: 50, stok: 0 }, 500)).toEqual({ status: "HABIS" });
  });

  it("Habis didahulukan daripada Kurang", () => {
    expect(statusTombolReward({ hargaPoin: 200, stok: 0 }, 0)).toEqual({ status: "HABIS" });
  });
});

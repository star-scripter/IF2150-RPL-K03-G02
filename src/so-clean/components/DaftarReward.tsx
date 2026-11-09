/**
 * Katalog reward (I04-05 s.d. I04-08): satu kartu per reward dengan tombol
 * Tukar / Kurang [selisih] / Habis.
 * Kelas DPPL: C10 - DaftarReward
 */
"use client";

import { statusTombolReward } from "@/lib/reward";
import type { Reward } from "@/types/api";

type Props = {
  daftar: Reward[];
  saldoPoin: number;
  onTukar: (reward: Reward) => void;
  onKurang: (reward: Reward) => void;
};

const WARNA_JENIS: Record<string, string> = {
  VOUCHER: "bg-sky-blue",
  DONASI: "bg-emerald",
  MERCHANDISE: "bg-emerald",
};

const GAYA_TOMBOL = "shrink-0 rounded-button px-4 py-2 text-sm font-medium";

function labelJenis(jenis: string) {
  return jenis.charAt(0) + jenis.slice(1).toLowerCase();
}

export default function DaftarReward({ daftar, saldoPoin, onTukar, onKurang }: Props) {
  if (daftar.length === 0) {
    return (
      <p className="rounded-card bg-border/40 p-6 text-center text-sm text-dark-teal">
        Belum ada reward yang tersedia.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {daftar.map((reward) => {
        const tombol = statusTombolReward(reward, saldoPoin);
        const habis = tombol.status === "HABIS";
        const warnaKartu = habis
          ? "bg-border text-dark-teal/60"
          : `${WARNA_JENIS[reward.jenis] ?? "bg-border/40"} text-dark-teal`;

        return (
          <li
            key={reward.idReward}
            className={`flex items-center justify-between gap-3 rounded-card p-4 ${warnaKartu}`}
          >
            <div className="min-w-0">
              <p className="text-xs">
                {labelJenis(reward.jenis)} · {habis ? "Stok habis" : `Stok ${reward.stok}`}
              </p>
              <p className="break-words font-bold">{reward.nama}</p>
              <p className="text-sm">{reward.hargaPoin.toLocaleString("id-ID")} poin</p>
            </div>

            {tombol.status === "TUKAR" && (
              <button
                type="button"
                onClick={() => onTukar(reward)}
                className={`${GAYA_TOMBOL} bg-dark-teal text-white`}
              >
                Tukar
              </button>
            )}
            {tombol.status === "KURANG" && (
              <button
                type="button"
                onClick={() => onKurang(reward)}
                className={`${GAYA_TOMBOL} bg-white text-dark-teal`}
              >
                Kurang {tombol.selisih.toLocaleString("id-ID")}
              </button>
            )}
            {habis && (
              <button type="button" disabled className={`${GAYA_TOMBOL} bg-white text-dark-teal/60`}>
                Habis
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

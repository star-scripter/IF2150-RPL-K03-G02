/**
 * TEMPLATE VIEW — contoh komponen daftar Reward (C10 DaftarReward, I-04).
 *
 * Cara pakai:
 * 1. Salin file ini dan beri nama PascalCase sesuai kelas view DPPL atau komponen UI,
 *    mis. `DaftarLaporan.tsx` (C04), `DaftarLokasi.tsx` (C07), `DaftarReward.tsx` (C10).
 * 2. Komponen dipakai oleh halaman di `app/(pages)/**\/page.tsx`. Halaman mengambil data
 *    dari `/api/...`, lalu meneruskannya ke komponen lewat props.
 *
 * Tanggung jawab view:
 * - Menampilkan data dan menerima input pengguna, lalu melaporkannya ke pemanggil lewat props
 *   callback (mis. `onPilih`).
 * - Mengambil data HANYA lewat endpoint `/api/...` sesuai kontrak. Jangan import apa pun dari
 *   `server/` (model, controller, db).
 *
 * "use client" di bawah diperlukan karena komponen ini memakai event handler (onClick).
 * Komponen yang hanya menampilkan data tanpa state/event boleh tanpa "use client".
 *
 * Kelas DPPL: Cxx - <NamaKelas>
 */
"use client";

// TODO(FE-04): ganti dengan `import type { Reward } from "@/types/api"` setelah tipe kontrak dibuat.
type Reward = {
  idReward: number;
  nama: string;
  jenis: string;
  hargaPoin: number;
  stok: number;
};

type Props = {
  daftar: Reward[];
  saldoPoin: number;
  onPilih: (idReward: number) => void;
};

export default function DaftarReward({ daftar, saldoPoin, onPilih }: Props) {
  if (daftar.length === 0) {
    return <p className="text-sm text-zinc-500">Belum ada reward yang tersedia.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {daftar.map((reward) => {
        const poinCukup = saldoPoin >= reward.hargaPoin;
        return (
          <li
            key={reward.idReward}
            className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
          >
            <div>
              <p className="font-medium">{reward.nama}</p>
              <p className="text-sm text-zinc-500">
                {reward.hargaPoin} poin · stok {reward.stok}
              </p>
            </div>
            <button
              type="button"
              disabled={!poinCukup}
              onClick={() => onPilih(reward.idReward)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              Tukar
            </button>
          </li>
        );
      })}
    </ul>
  );
}

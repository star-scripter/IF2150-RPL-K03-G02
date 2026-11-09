/**
 * Bottom sheet konfirmasi penukaran (I-05) yang tampil di atas Halaman Hadiah.
 * Kelas DPPL: C12 - HalamanPenukaran (pilihReward)
 *
 * TODO(FE-02): ganti <dialog> dengan BottomSheet dari komponen UI dasar setelah di-merge.
 */
"use client";

import { useEffect, useRef } from "react";
import { WARNA_JENIS, labelJenis } from "@/lib/reward";
import type { Reward } from "@/types/api";

type Props = {
  reward: Reward;
  saldoPoin: number;
  mengirim: boolean;
  pesanGagal: string | null;
  onBatal: () => void;
  onTukarkan: () => void;
};

const format = (n: number) => n.toLocaleString("id-ID");

export default function KonfirmasiPenukaran({
  reward,
  saldoPoin,
  mengirim,
  pesanGagal,
  onBatal,
  onTukarkan,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() memberi backdrop, mengunci fokus di dialog, dan memicu "cancel" saat Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Escape dan klik latar diabaikan selama request berjalan agar hasilnya tidak hilang.
  function tutupJikaBoleh() {
    if (!mengirim) onBatal();
  }

  // I05-05: hanya pratinjau; sisa poin sebenarnya dihitung server (BE-21).
  const sisaPoin = saldoPoin - reward.hargaPoin;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="judul-konfirmasi"
      onCancel={(e) => {
        e.preventDefault();
        tutupJikaBoleh();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) tutupJikaBoleh();
      }}
      className="mx-auto mt-auto mb-0 w-full max-w-md rounded-t-2xl bg-white p-5 text-dark-teal backdrop:bg-ink/40"
    >
      <h2 id="judul-konfirmasi" className="font-heading text-h3">
        Konfirmasi penukaran
      </h2>

      <div className={`mt-3 rounded-card p-4 ${WARNA_JENIS[reward.jenis] ?? "bg-border/40"}`}>
        <p className="text-xs">
          {labelJenis(reward.jenis)} · Stok {format(reward.stok)}
        </p>
        <p className="break-words font-bold">{reward.nama}</p>
      </div>

      <dl className="mt-4 flex flex-col gap-2 text-sm text-ink">
        <div className="flex justify-between">
          <dt>Poin Anda</dt>
          <dd className="font-medium">{format(saldoPoin)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Harga reward</dt>
          <dd className="font-medium">−{format(reward.hargaPoin)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <dt className="font-bold">Sisa poin</dt>
          <dd className="font-heading text-h2 text-dark-teal">{format(sisaPoin)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-ink/70">Poin yang sudah ditukarkan tidak dapat dikembalikan.</p>

      {pesanGagal && (
        <p role="alert" className="mt-3 rounded-card bg-danger/5 p-3 text-sm text-danger">
          {pesanGagal}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBatal}
          disabled={mengirim}
          className="rounded-button border border-dark-teal py-3 font-medium disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onTukarkan}
          disabled={mengirim}
          aria-busy={mengirim}
          className="rounded-button bg-emerald py-3 font-medium text-dark-teal disabled:opacity-60"
        >
          {mengirim ? "Memproses…" : "Tukarkan"}
        </button>
      </div>
    </dialog>
  );
}

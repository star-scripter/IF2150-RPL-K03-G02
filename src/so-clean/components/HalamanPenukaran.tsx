/**
 * Halaman Hadiah (I-04): memuat saldo dan katalog reward, lalu meneruskan reward
 * yang dipilih ke konfirmasi penukaran (FE-19).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DaftarReward from "@/components/DaftarReward";
import KartuSaldo from "@/components/KartuSaldo";
import { ApiError } from "@/lib/api/client";
import { poinApi, rewardApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import type { Reward } from "@/types/api";

type StateHalaman =
  | { status: "memuat" }
  | { status: "gagal"; pesan: string }
  | { status: "siap"; saldoPoin: number; daftar: Reward[] };

// Saldo dan reward dimuat paralel; jika salah satu gagal, seluruh halaman menampilkan error.
async function ambilData(signal: AbortSignal): Promise<StateHalaman> {
  try {
    const [saldo, daftar] = await Promise.all([
      poinApi.saldo({ signal }),
      rewardApi.daftar({ signal }),
    ]);
    return { status: "siap", saldoPoin: saldo.saldoPoin, daftar };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      status: "gagal",
      pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR"),
    };
  }
}

export default function HalamanPenukaran() {
  const [state, setState] = useState<StateHalaman>({ status: "memuat" });
  const [percobaan, setPercobaan] = useState(0);
  const [pesan, setPesan] = useState<string | null>(null);

  useEffect(() => {
    const pengendali = new AbortController();
    // Penolakan hanya terjadi saat request dibatalkan (unmount atau coba lagi), jadi diabaikan.
    ambilData(pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [percobaan]);

  // TODO(FE-02): ganti dengan Toast `notify` dari komponen UI dasar.
  useEffect(() => {
    if (!pesan) return;
    const timer = setTimeout(() => setPesan(null), 3000);
    return () => clearTimeout(timer);
  }, [pesan]);

  function cobaLagi() {
    setState({ status: "memuat" });
    setPercobaan((n) => n + 1);
  }

  // TODO(FE-19): buka bottom sheet KonfirmasiPenukaran untuk reward ini.
  function bukaKonfirmasi(reward: Reward) {
    setPesan(`${reward.nama} dipilih`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      {state.status === "memuat" && <KerangkaMuat />}

      {state.status === "gagal" && (
        <div role="alert" className="rounded-card border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          <p>{state.pesan}</p>
          <button
            type="button"
            onClick={cobaLagi}
            className="mt-3 rounded-button bg-danger px-4 py-2 font-medium text-white"
          >
            Coba lagi
          </button>
        </div>
      )}

      {state.status === "siap" && (
        <>
          <KartuSaldo saldoPoin={state.saldoPoin} />
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-h3 text-dark-teal">Redeem Poin Anda</h1>
              <Link href="/hadiah/riwayat" className="text-sm font-medium text-dark-teal underline">
                Riwayat
              </Link>
            </div>
            <DaftarReward
              daftar={state.daftar}
              saldoPoin={state.saldoPoin}
              onTukar={bukaKonfirmasi}
              onKurang={() => setPesan("Poin tidak cukup")}
            />
          </section>
        </>
      )}

      <p
        role="status"
        aria-live="polite"
        className={`fixed inset-x-4 bottom-24 mx-auto max-w-sm rounded-button bg-ink px-4 py-3 text-center text-sm text-white ${pesan ? "" : "hidden"}`}
      >
        {pesan}
      </p>
    </main>
  );
}

function KerangkaMuat() {
  return (
    <div aria-busy="true" aria-label="Memuat hadiah" className="flex animate-pulse flex-col gap-5">
      <div className="h-28 rounded-card bg-border" />
      <div className="h-5 w-40 rounded bg-border" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-card bg-border" />
      ))}
    </div>
  );
}

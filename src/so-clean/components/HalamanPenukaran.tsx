/**
 * Halaman Hadiah (I-04): memuat saldo dan katalog reward, lalu meneruskan reward
 * yang dipilih ke konfirmasi penukaran (FE-19).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DaftarReward from "@/components/DaftarReward";
import KartuSaldo from "@/components/KartuSaldo";
import KonfirmasiPenukaran from "@/components/KonfirmasiPenukaran";
import { ApiError } from "@/lib/api/client";
import { penukaranApi, poinApi, rewardApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { tindakanGagalTukar } from "@/lib/penukaran";
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
  const [dipilih, setDipilih] = useState<Reward | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  // Ref menahan klik kedua yang datang sebelum state `mengirim` sempat menonaktifkan tombol.
  const sedangMengirim = useRef(false);

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

  function bukaKonfirmasi(reward: Reward) {
    setPesanGagal(null);
    setDipilih(reward);
  }

  function tutupKonfirmasi() {
    setDipilih(null);
    setPesanGagal(null);
  }

  // Muat ulang tanpa kerangka agar notifikasi kegagalan tetap terbaca di atas daftar.
  function segarkan() {
    ambilData(new AbortController().signal).then(
      (hasil) => {
        if (hasil.status === "siap") setState(hasil);
      },
      () => {},
    );
  }

  async function tukarkan() {
    if (!dipilih || sedangMengirim.current) return;
    sedangMengirim.current = true;
    setMengirim(true);
    setPesanGagal(null);

    try {
      const hasil = await penukaranApi.tukar({ idReward: dipilih.idReward });
      setState((s) =>
        s.status === "siap"
          ? {
              ...s,
              saldoPoin: hasil.sisaPoin,
              daftar: s.daftar.map((r) =>
                r.idReward === dipilih.idReward ? { ...r, stok: r.stok - 1 } : r,
              ),
            }
          : s,
      );
      tutupKonfirmasi();
      // TODO(FE-20): buka I-06 dengan `hasil` alih-alih notifikasi.
      setPesan("Penukaran berhasil");
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
      const teks = error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR");
      const tindakan = tindakanGagalTukar(code);
      if (tindakan.tutup) {
        tutupKonfirmasi();
        setPesan(teks);
      } else {
        setPesanGagal(teks);
      }
      if (tindakan.muatUlang) segarkan();
    } finally {
      sedangMengirim.current = false;
      setMengirim(false);
    }
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
          {dipilih && (
            <KonfirmasiPenukaran
              reward={dipilih}
              saldoPoin={state.saldoPoin}
              mengirim={mengirim}
              pesanGagal={pesanGagal}
              onBatal={tutupKonfirmasi}
              onTukarkan={tukarkan}
            />
          )}
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

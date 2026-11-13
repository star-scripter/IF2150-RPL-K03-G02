/**
 * Halaman Hadiah (I-04): memuat saldo dan katalog reward, lalu meneruskan reward
 * yang dipilih ke konfirmasi penukaran (FE-19).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DaftarReward from "@/components/DaftarReward";
import KartuSaldo from "@/components/KartuSaldo";
import KonfirmasiPenukaran from "@/components/KonfirmasiPenukaran";
import { KotakGagal, notify } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { penukaranApi, poinApi, rewardApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { hapusHasilPenukaran, simpanHasilPenukaran } from "@/components/PenukaranBerhasil";
import { ROUTE } from "@/lib/nav";
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
  const router = useRouter();
  const [state, setState] = useState<StateHalaman>({ status: "memuat" });
  const [percobaan, setPercobaan] = useState(0);
  const [dipilih, setDipilih] = useState<Reward | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  // Ref menahan klik kedua yang datang sebelum state `mengirim` sempat menonaktifkan tombol.
  const sedangMengirim = useRef(false);

  // Hasil penukaran lama dibuang saat I-04 dibuka agar Back tidak menampilkan I-06 yang basi.
  // cacheComponents menyimpan state halaman yang ditinggalkan; cleanup berjalan saat I-04
  // disembunyikan, jadi sheet dan kunci kirim di-reset sebelum halaman dipakai lagi.
  useEffect(() => {
    hapusHasilPenukaran();
    return () => {
      sedangMengirim.current = false;
      setMengirim(false);
      setDipilih(null);
      setPesanGagal(null);
    };
  }, []);

  useEffect(() => {
    const pengendali = new AbortController();
    // Penolakan hanya terjadi saat request dibatalkan (unmount atau coba lagi), jadi diabaikan.
    ambilData(pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [percobaan]);

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
    let pindahHalaman = false;

    try {
      const hasil = await penukaranApi.tukar({ idReward: dipilih.idReward });
      if (simpanHasilPenukaran(hasil)) {
        pindahHalaman = true;
        router.push(ROUTE.hadiahBerhasil);
      } else {
        // Storage diblokir (mis. mode privat) sehingga I-06 tidak bisa dibuka; kode voucher
        // tetap ditampilkan lewat notifikasi yang tidak hilang sendiri.
        tutupKonfirmasi();
        notify.sukses(`Penukaran berhasil. Kode voucher: ${hasil.kodeVoucher}`, 0);
        segarkan();
      }
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
      const teks = error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR");
      const tindakan = tindakanGagalTukar(code);
      if (tindakan.tutup) {
        tutupKonfirmasi();
        notify.gagal(teks);
      } else {
        setPesanGagal(teks);
      }
      if (tindakan.muatUlang) segarkan();
    } finally {
      // Saat pindah ke I-06 tombol dibiarkan nonaktif agar penukaran tidak terkirim dua kali.
      if (!pindahHalaman) {
        sedangMengirim.current = false;
        setMengirim(false);
      }
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6 md:max-w-none md:p-0">
      {state.status === "memuat" && <KerangkaMuat />}

      {state.status === "gagal" && <KotakGagal pesan={state.pesan} onCobaLagi={cobaLagi} />}

      {state.status === "siap" && (
        <>
          <KartuSaldo saldoPoin={state.saldoPoin} />
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-h3 text-dark-teal">Redeem Poin Anda</h1>
              <Link href={ROUTE.hadiahRiwayat} className="text-sm font-medium text-dark-teal underline">
                Riwayat
              </Link>
            </div>
            <DaftarReward
              daftar={state.daftar}
              saldoPoin={state.saldoPoin}
              onTukar={bukaKonfirmasi}
              onKurang={() => notify.info("Poin tidak cukup")}
            />
          </section>
          <KonfirmasiPenukaran
            reward={dipilih}
            saldoPoin={state.saldoPoin}
            mengirim={mengirim}
            pesanGagal={pesanGagal}
            onBatal={tutupKonfirmasi}
            onTukarkan={tukarkan}
          />
        </>
      )}
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

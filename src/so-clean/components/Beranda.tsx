/**
 * Isi halaman Beranda Masyarakat (FE-08). Sumber: frame Figma "Main Page" (41:57), Body (41:64).
 * Padding mengikuti Figma (lebar 440px) mulai 400px; di HP yang lebih sempit dibuat lebih rapat.
 *
 * Objek DPPL I-03: IO3-001 username, IO3-002 saldo poin, IO3-003 Tukar Hadiah,
 * IO3-004 ReportIt, IO3-005 CleanIt. IO3-006–IO3-009 (bottom nav) dari layout FE-03.
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, kelasButton } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { MENU_LAPORAN, formatPoin } from "@/lib/beranda";
import { ROUTE } from "@/lib/nav";
import type { MeResponse } from "@/types/api";

type State =
  | { status: "memuat" }
  | { status: "gagal"; pesan: string }
  | { status: "siap"; pengguna: MeResponse };

/**
 * Ambil data Beranda dari `/api/me`. Ditolak hanya jika request dibatalkan (unmount atau
 * coba lagi); kegagalan lain dikembalikan sebagai state "gagal".
 */
async function ambilData(signal: AbortSignal): Promise<State> {
  try {
    return { status: "siap", pengguna: await authApi.me({ signal }) };
  } catch (error) {
    if (signal.aborted) throw error;
    return {
      status: "gagal",
      pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR"),
    };
  }
}

export function Beranda() {
  const [state, setState] = useState<State>({ status: "memuat" });
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    const pengendali = new AbortController();
    ambilData(pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [percobaan]);

  function cobaLagi() {
    setState({ status: "memuat" });
    setPercobaan((n) => n + 1);
  }

  return (
    <main className="flex flex-col gap-[25px] px-4 py-6 min-[400px]:px-[35px] min-[400px]:py-[31px]">
      <section aria-label="Sapaan" className="flex items-start gap-2.5 p-2.5">
        <h1 className="min-w-0 flex-1 text-h1 break-words text-ink">
          Horas,
          <br />
          {state.status === "siap" ? (
            state.pengguna.nama
          ) : (
            <span aria-hidden className="inline-block h-8 w-40 animate-pulse rounded-button bg-border align-middle" />
          )}
        </h1>
        <Link
          href={ROUTE.profil}
          aria-label="Profil"
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis dari Figma */}
          <img src="/icons/profil-besar.svg" alt="" width={68.1882} height={68.1882} />
        </Link>
      </section>

      <section
        aria-label="Saldo poin"
        className="flex flex-col gap-[23px] rounded-card border border-border bg-dark-teal px-6 py-[26px] min-[400px]:px-9"
      >
        <h2 className="flex min-h-[57px] items-center text-h2 text-white">Poin Anda</h2>
        {state.status === "gagal" ? (
          <div role="alert" className="flex flex-col items-start gap-3 text-white">
            <p className="text-body">{state.pesan}</p>
            <Button varian="sekunder" onClick={cobaLagi}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <p className="min-h-[58px] font-heading text-[64px] leading-[58px] font-bold text-light-green">
            {state.status === "siap" ? (
              formatPoin(state.pengguna.saldoPoin)
            ) : (
              <span aria-label="Memuat saldo" className="inline-block h-[58px] w-24 animate-pulse rounded-button bg-white/20" />
            )}
          </p>
        )}
        <Link href={ROUTE.hadiah} className={kelasButton({ ukuran: "lg", lebarPenuh: true })}>
          Tukar Hadiah
        </Link>
      </section>

      <h2 className="text-h2 text-dark-teal">Buat Laporan</h2>

      {MENU_LAPORAN.map((menu) => (
        <Link
          key={menu.id}
          href={menu.href}
          className={`flex items-start justify-between gap-[18px] rounded-card border border-border px-6 py-[26px] text-ink min-[400px]:px-9 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal ${menu.latar}`}
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-body min-[400px]:whitespace-nowrap">{menu.deskripsi}</span>
            <span className="font-heading text-h2">{menu.judul}</span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis dari Figma */}
          <img
            src={menu.ikon.src}
            alt=""
            width={menu.ikon.width}
            height={menu.ikon.height}
            className="mt-0.5 shrink-0"
          />
        </Link>
      ))}
    </main>
  );
}

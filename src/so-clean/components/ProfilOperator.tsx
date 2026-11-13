/**
 * Halaman Profil Operator (FE-24): nama dari GET /api/me dan logout. Desain disusun dari
 * komponen FE-02 karena Profil tidak ada di Figma (N13).
 * Kelas DPPL: C08 - Pengguna
 */
"use client";

import { useEffect, useState } from "react";
import { TombolKeluar } from "@/components/TombolKeluar";
import { Badge, Button, Card } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { inisialNama } from "@/lib/profil";
import type { MeResponse } from "@/types/api";

type State =
  | { status: "memuat" }
  | { status: "gagal"; pesan: string }
  | { status: "siap"; pengguna: MeResponse };

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

export function ProfilOperator() {
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
    <main className="flex flex-1 flex-col gap-6">
      <h1 className="text-h2 text-dark-teal">Profil Operator</h1>

      <Card varian="garis" className="w-full max-w-md gap-5">
        {state.status === "gagal" ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-card bg-danger-bg p-4 text-sm text-danger-text">
            <p>{state.pesan}</p>
            <Button varian="bahaya" onClick={cobaLagi}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-sky-blue font-heading text-h2 text-navy"
            >
              {state.status === "siap" ? inisialNama(state.pengguna.nama) : null}
            </span>
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              {state.status === "siap" ? (
                <p className="font-heading text-h3 break-words text-ink">{state.pengguna.nama}</p>
              ) : (
                <span aria-label="Memuat profil" className="block h-7 w-40 animate-pulse rounded-button bg-border" />
              )}
              <Badge varian="sukses">
                {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
                <img src="/icons/check.svg" alt="" width={14} height={14} />
                Operator
              </Badge>
            </div>
          </div>
        )}
        <TombolKeluar />
      </Card>
    </main>
  );
}

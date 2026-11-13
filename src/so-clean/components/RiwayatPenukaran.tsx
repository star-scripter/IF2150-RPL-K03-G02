/**
 * Halaman Riwayat Penukaran: daftar penukaran milik pengguna dari GET /api/penukaran dengan
 * pagination; halaman aktif dibaca dari `?page=`. Desain disusun dari komponen FE-02 (N13).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import KodeVoucher from "@/components/KodeVoucher";
import { Button, Card, KotakGagal, KotakKosong, Pagination } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { penukaranApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { LIMIT_RIWAYAT, bacaHalaman, formatWaktuPenukaran } from "@/lib/penukaran";
import type { PaginationMeta, Penukaran } from "@/types/api";

type StateRiwayat =
  | { status: "gagal"; halaman: number; pesan: string }
  | { status: "siap"; halaman: number; data: Penukaran[]; meta: PaginationMeta };

async function ambilRiwayat(halaman: number, signal: AbortSignal): Promise<StateRiwayat> {
  try {
    const { data, meta } = await penukaranApi.riwayat(
      { page: halaman, limit: LIMIT_RIWAYAT },
      { signal },
    );
    return { status: "siap", halaman, data, meta };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      status: "gagal",
      halaman,
      pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR"),
    };
  }
}

export default function RiwayatPenukaran() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-1">
        <Link href="/hadiah" className="flex w-fit items-center gap-1 text-sm font-medium text-dark-teal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/chevron-right.svg" alt="" width={16} height={16} className="rotate-180" />
          Hadiah
        </Link>
        <h1 className="text-h3 text-dark-teal">Riwayat Penukaran</h1>
      </div>
      {/* useSearchParams wajib di dalam Suspense saat cacheComponents aktif. */}
      <Suspense fallback={<KerangkaDaftar />}>
        <DaftarRiwayat />
      </Suspense>
    </main>
  );
}

function DaftarRiwayat() {
  const router = useRouter();
  const pathname = usePathname();
  const halaman = bacaHalaman(useSearchParams().get("page"));
  const [state, setState] = useState<StateRiwayat | null>(null);
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    const pengendali = new AbortController();
    // Request halaman sebelumnya dibatalkan saat halaman berubah; penolakannya diabaikan.
    ambilRiwayat(halaman, pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [halaman, percobaan]);

  // Hasil milik halaman lain berarti request halaman ini belum selesai.
  const aktif = state?.halaman === halaman ? state : null;

  function keHalaman(n: number) {
    router.push(n === 1 ? pathname : `${pathname}?page=${n}`, { scroll: false });
    window.scrollTo({ top: 0 });
  }

  function cobaLagi() {
    setState(null);
    setPercobaan((n) => n + 1);
  }

  if (!aktif) return <KerangkaDaftar />;

  if (aktif.status === "gagal") {
    return <KotakGagal pesan={aktif.pesan} onCobaLagi={cobaLagi} />;
  }

  const { data, meta } = aktif;

  if (meta.total === 0) {
    return (
      <KotakKosong
        judul="Belum ada penukaran"
        keterangan="Tukarkan poin Anda dengan hadiah, kode vouchernya akan tersimpan di sini."
        aksi={<Button onClick={() => router.push("/hadiah")}>Lihat Hadiah</Button>}
      />
    );
  }

  // Total > 0 tetapi data kosong: `?page=` melewati halaman terakhir.
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Pagination meta={meta} onUbah={keHalaman} satuan="penukaran" />
        <Button varian="sekunder" onClick={() => keHalaman(1)}>
          Ke halaman 1
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {data.map((p) => (
          <li key={p.idPenukaran}>
            <KartuRiwayat penukaran={p} />
          </li>
        ))}
      </ul>
      {meta.total > meta.limit && <Pagination meta={meta} onUbah={keHalaman} satuan="penukaran" />}
    </>
  );
}

function KartuRiwayat({ penukaran }: { penukaran: Penukaran }) {
  return (
    <Card varian="garis">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-semibold text-ink">{penukaran.namaReward}</h2>
        <time dateTime={penukaran.waktuPenukaran} className="text-sm text-text-secondary">
          {formatWaktuPenukaran(penukaran.waktuPenukaran)}
        </time>
      </div>
      <KodeVoucher kode={penukaran.kodeVoucher} />
      <div className="flex items-center justify-between text-sm">
        <span>Poin dipakai</span>
        <span className="font-semibold text-dark-teal">
          {penukaran.poinDipakai.toLocaleString("id-ID")}
        </span>
      </div>
    </Card>
  );
}

function KerangkaDaftar() {
  return (
    <div aria-busy="true" aria-label="Memuat riwayat penukaran" className="flex animate-pulse flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-44 rounded-card bg-border" />
      ))}
    </div>
  );
}

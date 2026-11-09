/**
 * Halaman Penukaran Berhasil (I-06): menampilkan hasil POST /api/penukaran yang disimpan
 * HalamanPenukaran di sessionStorage.
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import KodeVoucher from "@/components/KodeVoucher";
import { Button, Card } from "@/components/ui";
import { ROUTE } from "@/lib/nav";
import { formatIdPenukaran, formatWaktuPenukaran, uraiHasilPenukaran } from "@/lib/penukaran";
import type { TukarPoinResponse } from "@/types/api";

// Hasil POST /api/penukaran dibawa dari I-04 ke I-06 lewat sessionStorage karena tidak ada
// GET penukaran per id; data bertahan saat reload dan hilang saat tab ditutup.
const KUNCI_HASIL = "soclean:hasil-penukaran";

export function simpanHasilPenukaran(hasil: TukarPoinResponse): boolean {
  try {
    sessionStorage.setItem(KUNCI_HASIL, JSON.stringify(hasil));
    return true;
  } catch {
    return false;
  }
}

export function hapusHasilPenukaran(): void {
  try {
    sessionStorage.removeItem(KUNCI_HASIL);
  } catch {}
}

function bacaHasilPenukaran(): string | null {
  try {
    return sessionStorage.getItem(KUNCI_HASIL);
  } catch {
    return null;
  }
}

const tanpaLangganan = () => () => {};

export default function PenukaranBerhasil() {
  const router = useRouter();
  // Server tidak punya sessionStorage: snapshot `undefined` berarti belum dibaca,
  // jadi redirect hanya terjadi setelah klien membaca storage dan datanya kosong/rusak.
  const mentah = useSyncExternalStore(tanpaLangganan, bacaHasilPenukaran, () => undefined);
  const hasil = useMemo(
    () => (mentah === undefined ? undefined : uraiHasilPenukaran(mentah)),
    [mentah],
  );

  useEffect(() => {
    if (hasil === null) router.replace(ROUTE.hadiah);
  }, [hasil, router]);

  if (!hasil) return <main className="flex-1" />;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <Card varian="gelap" className="items-center px-5! text-center">
        <span className="grid size-16 place-items-center rounded-full bg-light-green text-dark-teal">
          {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
          <img src="/icons/check.svg" alt="" width={17} height={17} className="size-6" />
        </span>
        <h1 className="font-heading text-h3">Penukaran berhasil</h1>
        <p className="text-sm">{hasil.namaReward} sudah menjadi milik Anda.</p>
      </Card>

      <section aria-labelledby="judul-kode-voucher" className="flex flex-col gap-2">
        <h2 id="judul-kode-voucher" className="font-medium text-dark-teal">
          Kode Voucher
        </h2>
        <KodeVoucher kode={hasil.kodeVoucher} />
      </section>

      <dl className="flex flex-col gap-2 text-sm">
        <Baris label="ID penukaran">
          <span title={hasil.idPenukaran}>{formatIdPenukaran(hasil.idPenukaran)}</span>
        </Baris>
        <Baris label="Waktu penukaran">
          <time dateTime={hasil.waktuPenukaran}>{formatWaktuPenukaran(hasil.waktuPenukaran)}</time>
        </Baris>
        <Baris label="Poin dipakai">{hasil.poinDipakai.toLocaleString("id-ID")}</Baris>
        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <dt className="font-semibold">Sisa poin</dt>
          <dd className="font-heading text-h2 text-dark-teal">
            {hasil.sisaPoin.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        <Button lebarPenuh onClick={() => router.push(ROUTE.hadiah)}>
          Kembali ke Hadiah
        </Button>
        <Button varian="sekunder" lebarPenuh onClick={() => router.push(ROUTE.hadiahRiwayat)}>
          Lihat Riwayat
        </Button>
      </div>
    </main>
  );
}

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

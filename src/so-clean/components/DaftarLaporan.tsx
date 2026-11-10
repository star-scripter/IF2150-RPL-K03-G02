/**
 * Halaman validasi laporan Operator (I-07): tab ReportIt/CleanIt, jumlah laporan menunggu dari
 * `meta.total`, urutan terbaru/terlama, dan kartu 6 per halaman dari GET /api/laporan.
 * Tab, urutan, dan halaman disimpan di query URL. Tanpa checkbox: klik kartu langsung membuka
 * detail laporan (N10).
 * Kelas DPPL: C04 - DaftarLaporan
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Badge, Button, Card, Modal, Pagination } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { ApiError } from "@/lib/api/client";
import { laporanApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import {
  LABEL_JENIS,
  LIMIT_VALIDASI,
  bacaFilterValidasi,
  formatIdLaporan,
  formatWaktuKirim,
  formatWaktuLengkap,
  urlValidasi,
  type FilterValidasi,
} from "@/lib/laporan";
import type { JenisLaporan, Laporan, PaginationMeta } from "@/types/api";

// `kunci` = URL filter asal hasil; hasil dengan kunci lain milik filter sebelumnya.
// `sekarang` dicatat saat data tiba sehingga waktu relatif kartu tidak dihitung saat render.
type StateDaftar =
  | { status: "gagal"; kunci: string; pesan: string }
  | { status: "siap"; kunci: string; data: Laporan[]; meta: PaginationMeta; sekarang: number };

async function ambilDaftar(filter: FilterValidasi, signal: AbortSignal): Promise<StateDaftar> {
  const kunci = urlValidasi(filter);
  try {
    const { data, meta } = await laporanApi.daftar(
      {
        jenis: filter.jenis,
        status: "BELUM_DIPERIKSA",
        sort: filter.sort,
        page: filter.page,
        limit: LIMIT_VALIDASI,
      },
      { signal },
    );
    return { status: "siap", kunci, data, meta, sekarang: Date.now() };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      status: "gagal",
      kunci,
      pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR"),
    };
  }
}

const FOKUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal";

const TAB: readonly { jenis: JenisLaporan; ikon: string; lebar: number; tinggi: number }[] = [
  { jenis: "REPORTIT", ikon: "/icons/reportit.svg", lebar: 35.0877, tinggi: 40 },
  { jenis: "CLEANIT", ikon: "/icons/cleanit.svg", lebar: 32.25, tinggi: 35.8333 },
];

export default function DaftarLaporan() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      {/* useSearchParams wajib di dalam Suspense saat cacheComponents aktif. */}
      <Suspense fallback={<KerangkaHalaman />}>
        <IsiValidasi />
      </Suspense>
    </main>
  );
}

function IsiValidasi() {
  const router = useRouter();
  const filter = bacaFilterValidasi(useSearchParams());
  const { jenis, sort, page } = filter;
  const kunci = urlValidasi(filter);
  const [state, setState] = useState<StateDaftar | null>(null);
  const [percobaan, setPercobaan] = useState(0);
  const [dipilih, setDipilih] = useState<Laporan | null>(null);

  useEffect(() => {
    const pengendali = new AbortController();
    // Request filter sebelumnya dibatalkan saat tab/urutan/halaman berubah; penolakannya diabaikan.
    ambilDaftar({ jenis, sort, page }, pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [jenis, sort, page, percobaan]);

  // cacheComponents menyimpan state halaman yang ditinggalkan; detail ditutup saat halaman
  // disembunyikan agar tidak terbuka lagi ketika Operator kembali ke I-07.
  useEffect(() => () => setDipilih(null), []);

  const aktif = state?.kunci === kunci ? state : null;

  // Ganti tab atau urutan selalu kembali ke halaman 1.
  function ubahFilter(ubah: Partial<FilterValidasi>) {
    router.push(urlValidasi({ ...filter, page: 1, ...ubah }), { scroll: false });
  }

  function keHalaman(n: number) {
    router.push(urlValidasi({ ...filter, page: n }), { scroll: false });
    window.scrollTo({ top: 0 });
  }

  function muatUlang() {
    setState(null);
    setPercobaan((n) => n + 1);
  }

  let isi: ReactNode;
  if (!aktif) {
    isi = <KerangkaKartu />;
  } else if (aktif.status === "gagal") {
    isi = (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-card bg-danger-bg p-4 text-sm text-danger-text">
        <p>{aktif.pesan}</p>
        <Button varian="bahaya" onClick={muatUlang}>
          Coba lagi
        </Button>
      </div>
    );
  } else if (aktif.meta.total === 0) {
    isi = (
      <Card varian="lembut" className="items-center py-10 text-center">
        <p className="font-semibold text-ink">
          Tidak ada laporan {LABEL_JENIS[jenis]} yang menunggu validasi
        </p>
        <p className="text-sm text-text-secondary">Laporan baru dari warga akan muncul di sini.</p>
        <Button varian="sekunder" onClick={muatUlang}>
          Muat ulang
        </Button>
      </Card>
    );
  } else if (aktif.data.length === 0) {
    // Total > 0 tetapi halaman kosong: `?page=` melewati akhir, mis. karena laporan sudah diverifikasi.
    isi = (
      <div className="flex flex-col items-center gap-4">
        <Pagination meta={aktif.meta} onUbah={keHalaman} satuan="laporan" className="w-full" />
        <Button varian="sekunder" onClick={() => keHalaman(1)}>
          Ke halaman 1
        </Button>
      </div>
    );
  } else {
    isi = (
      <>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aktif.data.map((laporan) => (
            <li key={laporan.idLaporan}>
              <KartuLaporan
                laporan={laporan}
                sekarang={aktif.sekarang}
                terpilih={dipilih?.idLaporan === laporan.idLaporan}
                onBuka={() => setDipilih(laporan)}
              />
            </li>
          ))}
        </ul>
        <Pagination meta={aktif.meta} onUbah={keHalaman} satuan="laporan" />
      </>
    );
  }

  return (
    <>
      <TabJenis aktif={jenis} onPilih={(j) => ubahFilter({ jenis: j })} />
      <Judul total={aktif?.status === "siap" ? aktif.meta.total : null} memuat={!aktif} />
      <TombolUrutan
        sort={sort}
        onUbah={() => ubahFilter({ sort: sort === "terbaru" ? "terlama" : "terbaru" })}
      />
      <section aria-label={`Daftar laporan ${LABEL_JENIS[jenis]}`} className="flex flex-col gap-6">
        {isi}
      </section>

      {/* TODO(FE-23): ganti isi sementara dengan LaporanView (I-08), lalu panggil muatUlang setelah setujui/tolak. */}
      <Modal
        terbuka={dipilih !== null}
        onTutup={() => setDipilih(null)}
        label={dipilih ? formatIdLaporan(dipilih.idLaporan) : undefined}
        judul={dipilih?.judul ?? ""}
      >
        {dipilih && (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Card varian="lembut" className="gap-1">
                <dt className="text-sm text-text-secondary">Lokasi</dt>
                <dd className="text-dark-teal">{dipilih.lokasi}</dd>
              </Card>
              <Card varian="lembut" className="gap-1">
                <dt className="text-sm text-text-secondary">Dikirim</dt>
                <dd className="text-dark-teal">{formatWaktuLengkap(dipilih.createdAt)}</dd>
              </Card>
            </dl>
            <p className="text-sm text-text-secondary">
              Detail lengkap, galeri bukti, serta tombol Setujui dan Tolak dikerjakan di FE-23.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

function TabJenis({ aktif, onPilih }: { aktif: JenisLaporan; onPilih: (jenis: JenisLaporan) => void }) {
  return (
    <div
      role="group"
      aria-label="Jenis laporan"
      className="flex w-full gap-1 rounded-card border border-border bg-white p-1 sm:w-fit"
    >
      {TAB.map((tab) => {
        const dipilih = tab.jenis === aktif;
        return (
          <button
            key={tab.jenis}
            type="button"
            aria-pressed={dipilih}
            onClick={() => {
              if (!dipilih) onPilih(tab.jenis);
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-button px-6 py-2 sm:flex-none",
              FOKUS,
              dipilih ? "bg-emerald font-semibold text-dark-teal" : "font-medium text-ink hover:bg-surface",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ikon SVG statis dari Figma */}
            <img src={tab.ikon} alt="" width={tab.lebar} height={tab.tinggi} className="h-7 w-auto" />
            {LABEL_JENIS[tab.jenis]}
          </button>
        );
      })}
    </div>
  );
}

function Judul({ total, memuat }: { total: number | null; memuat: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-dark-teal">Validasi laporan</h1>
        <p className="text-body text-text-secondary">
          Periksa laporan warga dan pilih laporan untuk ditinjau.
        </p>
      </div>
      {memuat && <div aria-hidden className="h-8 w-44 animate-pulse rounded-full bg-border" />}
      {total !== null && (
        <Badge varian="peringatan" titik className="self-start">
          {total.toLocaleString("id-ID")} menunggu validasi
        </Badge>
      )}
    </div>
  );
}

function TombolUrutan({ sort, onUbah }: { sort: FilterValidasi["sort"]; onUbah: () => void }) {
  const label = sort === "terbaru" ? "Terbaru lebih dulu" : "Terlama lebih dulu";
  return (
    <button
      type="button"
      onClick={onUbah}
      aria-label={`Urutan: ${label}. Klik untuk mengubah urutan`}
      className={cn(
        "-my-2 flex w-fit items-center gap-1.5 rounded text-sm text-text-secondary hover:text-dark-teal",
        FOKUS,
      )}
    >
      {label}
      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2.5v11M1.75 11.25 4 13.5l2.25-2.25" />
        {/* Garis memendek ke bawah = terbaru dulu; memanjang = terlama dulu. */}
        <path d={sort === "terbaru" ? "M9 3.5h5.5M9 7h4M9 10.5h2.5" : "M9 3.5h2.5M9 7h4M9 10.5h5.5"} />
      </svg>
    </button>
  );
}

function KartuLaporan({
  laporan,
  sekarang,
  terpilih,
  onBuka,
}: {
  laporan: Laporan;
  sekarang: number;
  terpilih: boolean;
  onBuka: () => void;
}) {
  const id = formatIdLaporan(laporan.idLaporan);
  return (
    <Card
      onClick={onBuka}
      labelAksi={`Buka laporan ${id}: ${laporan.judul}`}
      terpilih={terpilih}
      className="h-full min-h-40 justify-between"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs text-text-secondary">{id}</p>
        <h2 className="line-clamp-2 text-h3 font-medium text-dark-teal">{laporan.judul}</h2>
      </div>
      <div className="flex items-end justify-between gap-3 text-xs text-text-secondary">
        <span className="min-w-0 truncate">{laporan.lokasi}</span>
        <time dateTime={laporan.createdAt} title={formatWaktuLengkap(laporan.createdAt)} className="shrink-0">
          {formatWaktuKirim(laporan.createdAt, sekarang)}
        </time>
      </div>
    </Card>
  );
}

function KerangkaKartu() {
  return (
    <div aria-busy="true" aria-label="Memuat laporan" className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: LIMIT_VALIDASI }, (_, i) => (
        <div key={i} className="h-40 rounded-card bg-border" />
      ))}
    </div>
  );
}

function KerangkaHalaman() {
  return (
    <>
      <div aria-hidden className="h-[50px] w-full animate-pulse rounded-card bg-border sm:w-80" />
      <Judul total={null} memuat />
      <KerangkaKartu />
    </>
  );
}

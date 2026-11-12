"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge, Button, Card, Dropdown } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { lokasiApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { ambilPosisiPengguna, bacaDaftarLokasi, urutkanLokasi, type PosisiPengguna, type UrutanLokasi } from "@/lib/lokasi";
import type { Lokasi } from "@/types/api";
import { KartuLokasi } from "./KartuLokasi";

type DataDaftar = { status: "memuat" } | { status: "gagal"; pesan: string } | { status: "siap"; daftar: Lokasi[] };
type DataGps = { status: "mencari" } | { status: "gagal"; pesan: string } | { status: "siap"; posisi: PosisiPengguna };

/** C07 / I-09. `kosong` menjadi slot integrasi tampilan I-10 milik FE-15. */
export function DaftarLokasi({ kosong }: { kosong?: ReactNode }) {
  const [data, setData] = useState<DataDaftar>({ status: "memuat" });
  const [gps, setGps] = useState<DataGps>({ status: "mencari" });
  const [percobaan, setPercobaan] = useState(0);
  const [percobaanGps, setPercobaanGps] = useState(0);
  const [pilihanUrutan, setPilihanUrutan] = useState<UrutanLokasi>("terdekat");
  const [sekarang, setSekarang] = useState(0);
  const posisi = gps.status === "siap" ? gps.posisi : null;
  // Label dropdown selalu sama dengan urutan sebenarnya, termasuk saat GPS ditolak.
  const urutan = posisi ? pilihanUrutan : "terbaru";
  const daftar = data.status === "siap" ? data.daftar : null;
  const terurut = useMemo(() => urutkanLokasi(daftar ?? [], urutan, posisi), [daftar, urutan, posisi]);

  useEffect(() => {
    const pengendali = new AbortController();
    async function muat() {
      try {
        const hasil = bacaDaftarLokasi(await lokasiApi.daftar({ status: "TERCEMAR" }, { signal: pengendali.signal }));
        if (!pengendali.signal.aborted) { setSekarang(Date.now()); setData({ status: "siap", daftar: hasil }); }
      } catch (error) {
        if (!pengendali.signal.aborted) setData({ status: "gagal", pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR") });
      }
    }
    void muat();
    return () => pengendali.abort();
  }, [percobaan]);

  useEffect(() => {
    const pengendali = new AbortController();
    ambilPosisiPengguna(navigator.geolocation, pengendali.signal, window.isSecureContext).then((hasil) => {
      if (!pengendali.signal.aborted) setGps({ status: "siap", posisi: hasil });
    }, (error: unknown) => {
      if (!pengendali.signal.aborted) setGps({ status: "gagal", pesan: error instanceof Error ? error.message : "Lokasi perangkat belum tersedia." });
    });
    return () => pengendali.abort();
  }, [percobaanGps]);

  useEffect(() => {
    const timer = setInterval(() => setSekarang(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  function cobaGps() { setGps({ status: "mencari" }); setPercobaanGps((nilai) => nilai + 1); }

  return <main className="flex flex-1 flex-col gap-5 px-4 py-6 text-dark-teal min-[400px]:px-[35px] min-[400px]:py-[31px]">
    <div className="space-y-1">
      <h1 className="text-h2">Lokasi Tercemar</h1>
      <p className="text-body text-text-secondary">Pilih lokasi, bersihkan, lalu kirim buktinya lewat CleanIt.</p>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      {data.status === "siap"
        ? <Badge varian="netral" titik className="border-0! bg-emerald/10! text-dark-teal! [&>span]:bg-emerald!" role="status">{data.daftar.length.toLocaleString("id-ID")} lokasi menunggu</Badge>
        : <span className="h-9 w-40 animate-pulse rounded-full bg-surface" aria-hidden />}
      <div className="w-32 shrink-0 [&_label]:sr-only [&>div]:gap-0">
        <Dropdown id="urutan-lokasi" label="Urutkan lokasi" value={urutan} disabled={data.status !== "siap" || !data.daftar.length}
          pilihan={[{ nilai: "terdekat", label: "Terdekat" }, { nilai: "terbaru", label: "Terbaru" }]}
          className="min-h-9! border-0! bg-transparent! py-1! pl-2! text-sm!"
          onChange={(event) => {
            const nilai = event.target.value === "terdekat" ? "terdekat" : "terbaru";
            setPilihanUrutan(nilai);
            if (nilai === "terdekat" && gps.status === "gagal") cobaGps();
          }} />
      </div>
    </div>
    {data.status === "memuat" ? <MemuatDaftar /> : data.status === "gagal" ? (
      <Card className="items-start" role="alert">
        <h2 className="text-h3">Lokasi belum dapat dimuat</h2>
        <p className="text-sm leading-relaxed text-text-secondary">{data.pesan}</p>
        <Button varian="sekunder" onClick={() => { setData({ status: "memuat" }); setPercobaan((nilai) => nilai + 1); }}>Coba lagi</Button>
      </Card>
    ) : !data.daftar.length ? (
      kosong ?? <p role="status" className="rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">Belum ada lokasi tercemar untuk ditampilkan.</p>
    ) : <>
      {gps.status === "mencari" && <p role="status" className="text-xs leading-relaxed text-text-secondary">Mencari lokasi perangkat… Untuk sementara, daftar diurutkan dari laporan terbaru.</p>}
      {gps.status === "gagal" && <div className="space-y-1 rounded-card bg-surface p-3 text-xs leading-relaxed text-text-secondary">
        <p role="status">{gps.pesan} Daftar diurutkan dari laporan terbaru.</p>
        <button type="button" onClick={() => { setPilihanUrutan("terdekat"); cobaGps(); }} className="min-h-8 rounded-button font-semibold text-dark-teal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-dark-teal">Coba GPS lagi</button>
      </div>}
      <ul aria-label="Daftar lokasi tercemar" className="space-y-4">
        {terurut.map((lokasi) => <li key={lokasi.idLokasi}><KartuLokasi lokasi={lokasi} sekarang={sekarang} /></li>)}
      </ul>
    </>}
  </main>;
}

function MemuatDaftar() {
  return <div role="status" aria-label="Memuat lokasi" className="space-y-4">
    {[0, 1, 2].map((nomor) => <div key={nomor} aria-hidden className="space-y-4 rounded-card border border-border p-5">
      <div className="h-6 w-2/3 animate-pulse rounded bg-surface" />
      <div className="h-14 animate-pulse rounded bg-surface" />
      <div className="h-12 animate-pulse rounded-button bg-emerald/10" />
    </div>)}
  </div>;
}

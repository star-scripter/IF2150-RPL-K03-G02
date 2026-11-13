"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { Badge, Button, Card, kelasButton } from "@/components/ui";
import { PetaLaporan } from "@/components/laporan/informasi-dasar/PetaLaporan";
import { ApiError } from "@/lib/api/client";
import { lokasiApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import { bacaDetailLokasi } from "@/lib/detail-lokasi";
import { formatIdLaporan, formatWaktuLengkap, LABEL_JENIS_SAMPAH, LABEL_SUMBER } from "@/lib/laporan";
import { ROUTE } from "@/lib/nav";
import type { LokasiDetail } from "@/types/api";
import { BingkaiDetailLokasi, KerangkaDetailLokasi } from "./KerangkaDetailLokasi";
import { KonfirmasiBersihkan } from "./KonfirmasiBersihkan";
import { MediaLokasi } from "./MediaLokasi";

type DataDetail = { status: "memuat" } | { status: "tidak-ditemukan" } | { status: "gagal"; pesan: string } | { status: "siap"; lokasi: LokasiDetail };

/** C14: tampilkan_lokasi() dan konfirmasi_bersihkan(), memakai GET BE-17. */
export function DetailLokasi({ idLokasi }: { idLokasi: number | null }) {
  const [data, setData] = useState<DataDetail>({ status: idLokasi === null ? "tidak-ditemukan" : "memuat" });
  const [percobaan, setPercobaan] = useState(0);
  const [konfirmasi, setKonfirmasi] = useState(false);
  useLayoutEffect(() => () => {
    // Activity menyimpan DOM route. Lepas peta dan dialog sebelum disembunyikan,
    // lalu muat data terbaru dan instance Leaflet baru ketika detail dibuka kembali.
    setKonfirmasi(false);
    if (idLokasi !== null) setData({ status: "memuat" });
  }, [idLokasi]);
  useEffect(() => {
    if (idLokasi === null) return;
    const pengendali = new AbortController();
    async function muat() {
      try {
        const hasil = bacaDetailLokasi(await lokasiApi.detail(idLokasi!, { signal: pengendali.signal }), idLokasi!);
        if (!pengendali.signal.aborted) setData({ status: "siap", lokasi: hasil });
      } catch (error) {
        if (pengendali.signal.aborted) return;
        setData(error instanceof ApiError && error.code === "NOT_FOUND"
          ? { status: "tidak-ditemukan" }
          : { status: "gagal", pesan: error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR") });
      }
    }
    void muat(); return () => pengendali.abort();
  }, [idLokasi, percobaan]);

  if (data.status === "memuat") return <KerangkaDetailLokasi />;
  if (data.status === "tidak-ditemukan") return <BingkaiDetailLokasi>
    <Card role="status">
      <h1 className="text-h2">Lokasi tidak ditemukan</h1>
      <p className="text-sm leading-relaxed text-text-secondary">Lokasi yang Anda cari tidak tersedia. Pilih lokasi lain dari daftar.</p>
      <Link href={ROUTE.lokasi} className={kelasButton({ lebarPenuh: true })}>Lihat Daftar Lokasi</Link>
    </Card>
  </BingkaiDetailLokasi>;
  if (data.status === "gagal") return <BingkaiDetailLokasi>
    <Card role="alert" className="items-start">
      <h1 className="text-h2">Detail lokasi belum dapat dimuat</h1>
      <p className="text-sm leading-relaxed text-text-secondary">{data.pesan}</p>
      <Button varian="sekunder" onClick={() => { setData({ status: "memuat" }); setPercobaan((n) => n + 1); }}>Coba lagi</Button>
    </Card>
  </BingkaiDetailLokasi>;

  const { lokasi } = data;
  const bersih = lokasi.status === "DIBERSIHKAN";
  return <BingkaiDetailLokasi>
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge varian={bersih ? "sukses" : "bahaya"} titik>{bersih ? "Dibersihkan" : "Tercemar"}</Badge>
        <Badge>+{lokasi.poin.toLocaleString("id-ID")} poin</Badge>
      </div>
      <h1 className="text-h2 break-words">{lokasi.nama}</h1>
      <p className="break-words text-sm leading-relaxed text-text-secondary">{lokasi.alamat}</p>
    </div>
    <Card>
      <h2 className="text-h3">Lokasi Pencemaran</h2>
      <div className="h-56 rounded-button border border-border"><PetaLaporan koordinat={{ latitude: lokasi.latitude, longitude: lokasi.longitude }} interaktif={false} /></div>
      <p className="text-xs text-text-secondary">Koordinat: {lokasi.latitude.toFixed(6)}, {lokasi.longitude.toFixed(6)}</p>
      <dl className="space-y-3 text-sm">
        <div><dt className="font-semibold">Jenis Sampah</dt><dd className="mt-1 text-text-secondary">{LABEL_JENIS_SAMPAH[lokasi.jenisSampah]}</dd></div>
        <div><dt className="font-semibold">Laporan masuk</dt><dd className="mt-1 text-text-secondary"><time dateTime={lokasi.dilaporkanAt}>{formatWaktuLengkap(lokasi.dilaporkanAt)}</time></dd></div>
      </dl>
    </Card>
    <Card>
      <div className="space-y-1"><h2 className="text-h3">Laporan Asal</h2><p className="text-xs text-text-secondary">{formatIdLaporan(lokasi.laporanAsal.idLaporan)}</p></div>
      <h3 className="break-words text-base font-semibold">{lokasi.laporanAsal.judul}</h3>
      <dl className="space-y-3 text-sm">
        <div><dt className="font-semibold">Waktu Kejadian</dt><dd className="mt-1 text-text-secondary"><time dateTime={lokasi.laporanAsal.waktu}>{formatWaktuLengkap(lokasi.laporanAsal.waktu)}</time></dd></div>
        <div><dt className="font-semibold">Sumber Laporan</dt><dd className="mt-1 text-text-secondary">{LABEL_SUMBER[lokasi.laporanAsal.sumber]}</dd></div>
      </dl>
      <section aria-label="Bukti laporan asal" className="space-y-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Bukti Laporan Asal</h3>
        {lokasi.laporanAsal.media.length
          ? lokasi.laporanAsal.media.map((media, index) => <MediaLokasi key={`${media.idMedia}:${media.url}`} media={media} nomor={index + 1} />)
          : <p className="text-sm text-text-secondary">Belum ada bukti media pada laporan asal.</p>}
      </section>
    </Card>
    <Card varian="lembut">
      <h2 className="text-h3">{bersih ? "Lokasi sudah dibersihkan" : "Bantu bersihkan lokasi ini"}</h2>
      <p id="status-pembersihan" role={bersih ? "status" : undefined} className="text-sm leading-relaxed text-text-secondary">{bersih
        ? "Lokasi ini sudah dibersihkan. Pilih lokasi tercemar lain untuk berkontribusi."
        : `Kirim bukti pembersihan lewat CleanIt. Anda memperoleh ${lokasi.poin.toLocaleString("id-ID")} poin setelah bukti dinyatakan valid oleh Operator.`}</p>
      <Button disabled={bersih} aria-describedby="status-pembersihan" lebarPenuh onClick={() => { if (!bersih) setKonfirmasi(true); }}>Bersihkan</Button>
    </Card>
    <KonfirmasiBersihkan lokasi={lokasi} terbuka={konfirmasi} onTutup={() => setKonfirmasi(false)} />
  </BingkaiDetailLokasi>;
}

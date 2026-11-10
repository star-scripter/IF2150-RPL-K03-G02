"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Button, ProgressLangkah } from "@/components/ui";
import { LANGKAH_LAPORAN, type AwalFormLaporan, type LangkahLaporan } from "@/lib/form-laporan";
import { ROUTE } from "@/lib/nav";
import { BuktiMedia } from "./BuktiMedia";
import { FormLaporanProvider, useFormLaporan } from "./FormLaporanProvider";
import { InformasiDasar } from "./InformasiDasar";
import { PemberitahuanDraf } from "./PemberitahuanDraf";
import { TinjauLaporan } from "./TinjauLaporan";
import { IkonLaporan } from "./VisualLaporan";

type Props = {
  awal?: AwalFormLaporan;
  /** FE-10/11/12 dapat mengganti isi langkah tanpa mengganti provider/navigasi. */
  isiLangkah?: Partial<Record<LangkahLaporan, ReactNode>>;
  /** FE-12 memasang komponen tombol yang memakai useFormLaporan untuk mengirim. */
  aksiKirim?: ReactNode;
};

const AWAL_REPORTIT: AwalFormLaporan = { konfigurasi: { jenis: "REPORTIT" } };

export function FormLaporan({ awal = AWAL_REPORTIT, ...props }: Props) {
  return (
    <FormLaporanProvider awal={awal}>
      <IsiFormLaporan {...props} />
    </FormLaporanProvider>
  );
}

function IsiFormLaporan({ isiLangkah, aksiKirim }: Omit<Props, "awal">) {
  const { state, dispatch } = useFormLaporan();
  const area = useRef<HTMLElement>(null);
  const pertamaRender = useRef(true);
  const cleanit = state.konfigurasi.jenis === "CLEANIT";
  const { langkah, bagianDiedit } = state;
  const judul = [
    cleanit ? "Buat Laporan Pembersihan" : "Buat Laporan Pencemaran",
    cleanit ? "Unggah Bukti Pembersihan" : "Unggah Bukti Pencemaran",
    "Tinjau Laporan Anda",
  ];
  const deskripsi = [
    cleanit ? "Lengkapi informasi pembersihan lokasi yang telah Anda pilih." : "Laporkan lokasi perairan tercemar agar dapat diverifikasi dan ditindaklanjuti.",
    cleanit ? "Tambahkan foto atau video yang menunjukkan hasil pembersihan di lokasi tersebut." : "Tambahkan foto atau video yang menunjukkan kondisi pencemaran di lokasi tersebut.",
    "Pastikan semua informasi sudah benar sebelum mengirim laporan.",
  ];

  useEffect(() => {
    // Hindari autofocus saat halaman baru dibuka; pindahkan fokus hanya setelah navigasi langkah.
    if (pertamaRender.current) {
      pertamaRender.current = false;
      return;
    }
    const target = bagianDiedit
      ? area.current?.querySelector<HTMLElement>(`#laporan-${bagianDiedit}`)
      : null;
    (target ?? area.current?.querySelector<HTMLElement>("h1"))?.focus({ preventScroll: true });
    // Field terakhir dapat berada di bawah viewport; fokus Ubah juga harus terlihat.
    if (target) target.scrollIntoView({ block: "center", behavior: "instant" });
    else area.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [langkah, bagianDiedit]);

  const kelasKembali = "flex size-11 shrink-0 items-center justify-center rounded-button text-dark-teal hover:bg-surface focus-visible:outline-2 focus-visible:outline-dark-teal";

  return (
    <main ref={area} className="flex flex-1 flex-col bg-surface text-dark-teal">
      <div className="md:flex md:items-center md:justify-between md:gap-8">
        <div className="flex items-center gap-1 bg-white px-3 py-2 md:bg-transparent md:px-0">
          {langkah === 0 && !bagianDiedit ? (
            <Link href={cleanit ? ROUTE.lokasi : ROUTE.beranda} aria-label="Kembali tanpa mengirim laporan" className={kelasKembali}>
              <IkonLaporan nama="kembali" className="size-5" />
            </Link>
          ) : (
            <button
              type="button" className={kelasKembali} onClick={() => dispatch({ tipe: "kembali" })}
              aria-label={bagianDiedit ? "Kembali ke tinjauan laporan" : `Kembali ke ${LANGKAH_LAPORAN[langkah - 1]}`}
            ><IkonLaporan nama="kembali" className="size-5" /></button>
          )}
          <p className="font-heading text-base font-semibold whitespace-nowrap text-ink">Form Laporan</p>
        </div>
        <ProgressLangkah langkah={LANGKAH_LAPORAN} aktif={langkah} className="py-4 md:max-w-[480px] md:bg-transparent md:px-0 md:py-0" />
      </div>
      <form
        className="flex flex-1 flex-col" aria-label={`Form Laporan · ${LANGKAH_LAPORAN[langkah]}`}
        onSubmit={(event) => { event.preventDefault(); if (langkah < 2) dispatch({ tipe: "lanjut" }); }}
      >
        <section aria-labelledby="judul-langkah" className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-8 min-[400px]:px-5 md:gap-6 md:px-0 md:pt-8">
          <div className="space-y-1.5">
            <h1 id="judul-langkah" tabIndex={-1} className="font-heading text-xl leading-7 font-bold outline-none md:text-h1">{judul[langkah]}</h1>
            <p className="text-xs leading-relaxed text-text-secondary md:text-body">{deskripsi[langkah]}</p>
          </div>
          <PemberitahuanDraf />
          {isiLangkah?.[langkah] ?? [<InformasiDasar key="informasi" />, <BuktiMedia key="media" />, <TinjauLaporan key="tinjau" />][langkah]}
        </section>
        <footer className="mt-auto space-y-2 border-t border-border/50 bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] min-[400px]:px-5 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0 md:bg-transparent md:px-0 md:pt-5 md:pb-0">
          <p className="text-center text-[10px] font-medium uppercase tracking-wide text-text-secondary md:text-left md:text-xs" role="status">Langkah {langkah + 1} dari 3</p>
          <div className="space-y-2 md:w-64 md:shrink-0">
            {langkah === 2 ? (
              aksiKirim ?? (
                <>
                  <Button disabled lebarPenuh aria-describedby="status-kirim">Kirim Laporan<IkonLaporan nama="panah" className="size-4 -rotate-45" /></Button>
                  <p id="status-kirim" className="text-center text-xs text-text-secondary">Pengiriman laporan belum tersedia.</p>
                </>
              )
            ) : (
              <Button type="submit" lebarPenuh disabled={langkah === 1 && state.media.length === 0}>
                {bagianDiedit ? "Simpan Perubahan" : "Lanjut"}<IkonLaporan nama="panah" className="size-4" />
              </Button>
            )}
          </div>
        </footer>
      </form>
    </main>
  );
}

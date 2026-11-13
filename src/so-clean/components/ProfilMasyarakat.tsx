/**
 * Halaman Profil Masyarakat (FE-24): nama, email, saldo dari GET /api/me, daftar notifikasi
 * dari GET /api/notifikasi (BE-23), tandai dibaca, dan logout. Desain disusun dari komponen
 * FE-02 karena Profil tidak ada di Figma (N13).
 * Kelas DPPL: C08 - Pengguna (notify)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import KartuSaldo from "@/components/KartuSaldo";
import { TombolKeluar } from "@/components/TombolKeluar";
import { Badge, Button, Card, notify } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { ApiError } from "@/lib/api/client";
import { authApi, notifikasiApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import {
  LABEL_JENIS_LAPORAN,
  LABEL_STATUS_NOTIFIKASI,
  alasanNotifikasi,
  formatWaktuNotifikasi,
  jumlahBelumDibaca,
  pesanNotifikasi,
} from "@/lib/profil";
import type { MeResponse, Notifikasi } from "@/types/api";

type StateMuat<T> =
  | { status: "memuat" }
  | { status: "gagal"; pesan: string }
  | { status: "siap"; data: T };

function pesanDari(error: unknown): string {
  return error instanceof ApiError ? error.message : pesanError("INTERNAL_ERROR");
}

/** Ditolak hanya jika request dibatalkan; kegagalan lain menjadi state "gagal". */
async function muat<T>(ambil: () => Promise<T>, signal: AbortSignal): Promise<StateMuat<T>> {
  try {
    return { status: "siap", data: await ambil() };
  } catch (error) {
    if (signal.aborted) throw error;
    return { status: "gagal", pesan: pesanDari(error) };
  }
}

/**
 * State + muat ulang untuk satu endpoint. `ambil` harus fungsi yang stabil (dideklarasikan di
 * level modul). Request lama dibatalkan saat dicoba lagi atau saat halaman ditinggalkan.
 */
function useMuat<T>(ambil: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<StateMuat<T>>({ status: "memuat" });
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    const pengendali = new AbortController();
    muat(() => ambil(pengendali.signal), pengendali.signal).then(setState, () => {});
    return () => pengendali.abort();
  }, [ambil, percobaan]);

  function cobaLagi() {
    setState({ status: "memuat" });
    setPercobaan((n) => n + 1);
  }

  return { state, setState, cobaLagi };
}

const ambilPengguna = (signal: AbortSignal) => authApi.me({ signal });
const ambilNotifikasi = (signal: AbortSignal) => notifikasiApi.daftar({ signal });

export function ProfilMasyarakat() {
  const pengguna = useMuat<MeResponse>(ambilPengguna);
  const notifikasi = useMuat<Notifikasi[]>(ambilNotifikasi);

  return (
    <main className="flex flex-col gap-6 px-4 py-6 min-[400px]:px-8">
      <h1 className="text-h2 text-dark-teal">Profil</h1>

      {pengguna.state.status === "gagal" ? (
        <KotakGagal pesan={pengguna.state.pesan} onCobaLagi={pengguna.cobaLagi} />
      ) : pengguna.state.status === "memuat" ? (
        <div aria-busy="true" aria-label="Memuat profil" className="flex animate-pulse flex-col gap-4">
          <div className="h-[108px] rounded-card bg-border" />
          <div className="h-[104px] rounded-card bg-border" />
        </div>
      ) : (
        <>
          <KartuAkun pengguna={pengguna.state.data} />
          <KartuSaldo saldoPoin={pengguna.state.data.saldoPoin} />
        </>
      )}

      <BagianNotifikasi
        state={notifikasi.state}
        onCobaLagi={notifikasi.cobaLagi}
        onDiperbarui={(daftar) => notifikasi.setState({ status: "siap", data: daftar })}
      />

      <TombolKeluar />
    </main>
  );
}

function KartuAkun({ pengguna }: { pengguna: MeResponse }) {
  return (
    <Card varian="garis" className="flex-row items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis dari Figma */}
      <img src="/icons/profil-besar.svg" alt="" width={68.1882} height={68.1882} className="shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-heading text-h3 break-words text-ink">{pengguna.nama}</p>
        <p className="text-sm break-all text-text-secondary">{pengguna.email}</p>
      </div>
    </Card>
  );
}

type PropsBagianNotifikasi = {
  state: StateMuat<Notifikasi[]>;
  onCobaLagi: () => void;
  onDiperbarui: (daftar: Notifikasi[]) => void;
};

function BagianNotifikasi({ state, onCobaLagi, onDiperbarui }: PropsBagianNotifikasi) {
  const [menandai, setMenandai] = useState(false);
  // State baru terbaca setelah render ulang; ref mencegah klik ganda mengirim dua request.
  const sedangMenandai = useRef(false);
  const daftar = state.status === "siap" ? state.data : [];
  const belumDibaca = jumlahBelumDibaca(daftar);

  async function tandaiDibaca() {
    if (sedangMenandai.current) return;
    sedangMenandai.current = true;
    setMenandai(true);
    try {
      await notifikasiApi.tandaiDibaca();
      // Server menandai semua notifikasi sampai waktu request ini, termasuk yang masuk setelah
      // daftar dimuat. Daftar dimuat ulang agar notifikasi baru seperti itu tetap terlihat; jika
      // gagal, cukup tandai yang sudah tampil.
      try {
        onDiperbarui(await notifikasiApi.daftar());
      } catch {
        onDiperbarui(daftar.map((n) => ({ ...n, dibaca: true })));
      }
    } catch (error) {
      notify.gagal(pesanDari(error));
    } finally {
      sedangMenandai.current = false;
      setMenandai(false);
    }
  }

  return (
    <section aria-labelledby="judul-notifikasi" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <h2 id="judul-notifikasi" className="text-h3 text-dark-teal">
            Notifikasi
          </h2>
          {belumDibaca > 0 && (
            <Badge varian="peringatan" titik>
              {belumDibaca} baru
            </Badge>
          )}
        </div>
        {belumDibaca > 0 && (
          <Button varian="teks" onClick={tandaiDibaca} disabled={menandai}>
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {state.status === "memuat" ? (
        <div aria-busy="true" aria-label="Memuat notifikasi" className="flex animate-pulse flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 rounded-card bg-border" />
          ))}
        </div>
      ) : state.status === "gagal" ? (
        <KotakGagal pesan={state.pesan} onCobaLagi={onCobaLagi} />
      ) : daftar.length === 0 ? (
        <Card varian="lembut" className="items-center py-8 text-center">
          <p className="font-semibold text-ink">Belum ada notifikasi</p>
          <p className="text-sm text-text-secondary">
            Hasil pemeriksaan laporan ReportIt dan CleanIt Anda oleh Operator akan muncul di sini.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((n) => (
            <li key={n.idLaporan}>
              <KartuNotifikasi notifikasi={n} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function KartuNotifikasi({ notifikasi: n }: { notifikasi: Notifikasi }) {
  const alasan = alasanNotifikasi(n);
  return (
    <Card varian="garis" className={cn("gap-2.5", !n.dibaca && "border-emerald")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge varian={n.status === "VALID" ? "sukses" : "bahaya"}>
          {LABEL_STATUS_NOTIFIKASI[n.status]}
        </Badge>
        <span className="text-sm font-medium text-text-secondary">{LABEL_JENIS_LAPORAN[n.jenis]}</span>
        {!n.dibaca && (
          <Badge varian="peringatan" titik className="ml-auto">
            Baru
          </Badge>
        )}
      </div>
      <h3 className="font-semibold break-words text-ink">{n.judul}</h3>
      <p className="text-sm text-ink">{pesanNotifikasi(n)}</p>
      {alasan && (
        <p className="rounded-button bg-danger-bg px-3 py-2 text-sm break-words text-danger-text">
          <span className="font-semibold">Alasan: </span>
          {alasan}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <time dateTime={n.waktu} className="text-sm text-text-secondary">
          {formatWaktuNotifikasi(n.waktu)}
        </time>
        {n.poinDiberikan ? <Badge>+{n.poinDiberikan.toLocaleString("id-ID")} poin</Badge> : null}
      </div>
    </Card>
  );
}

function KotakGagal({ pesan, onCobaLagi }: { pesan: string; onCobaLagi: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-card bg-danger-bg p-4 text-sm text-danger-text">
      <p>{pesan}</p>
      <Button varian="bahaya" onClick={onCobaLagi}>
        Coba lagi
      </Button>
    </div>
  );
}

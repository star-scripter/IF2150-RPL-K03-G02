/**
 * Modal detail laporan (I-08) yang dibuka dari kartu halaman validasi (I-07): info laporan,
 * galeri bukti, serta Setujui/Tolak ke POST /api/laporan/:id/setujui|tolak.
 * ReportIt disetujui dengan poin 50/100/200 dan nama lokasi (K3, K9); jika ada lokasi TERCEMAR
 * dalam 50 m, laporan digabung dan kedua isian dinonaktifkan (K13). CleanIt menampilkan galeri
 * Sebelum/Sesudah dan tanda "Pelapor = Relawan" (N9, Aturan CleanIt 6), dan wajib beralasan
 * saat ditolak.
 * Kelas DPPL: C14 - LaporanView
 */
"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  KotakGagal,
  Modal,
  Textarea,
  Textbox,
  type VarianBadge,
} from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { ApiError } from "@/lib/api/client";
import { laporanApi } from "@/lib/api/endpoints";
import { pesanError } from "@/lib/api/pesan-error";
import {
  LABEL_JENIS_SAMPAH,
  LABEL_STATUS,
  LABEL_SUMBER,
  MAKS_NAMA_LOKASI,
  PILIHAN_POIN,
  POIN_DEFAULT,
  bodySetujui,
  bodyTolak,
  cekAlasanTolak,
  cekIsianSetujui,
  formatIdLaporan,
  formatJarak,
  formatKoordinat,
  formatWaktuLengkap,
  formatWaktuUnggah,
  pesanSetujui,
  tindakanGagalVerifikasi,
  urlPeta,
} from "@/lib/laporan";
import type { Laporan, LaporanDetail, Media, PilihanPoin, StatusLaporan } from "@/types/api";

type Props = {
  /** Ringkasan dari kartu I-07; null = modal tertutup. */
  laporan: Laporan | null;
  onTutup: () => void;
  /** Status laporan berubah atau ternyata sudah berubah; I-07 memuat ulang list. */
  onDiverifikasi: () => void;
};

type StateDetail =
  | { status: "memuat" }
  | { status: "gagal"; pesan: string; bisaUlang: boolean }
  | { status: "siap"; data: LaporanDetail };

type Aksi = "setujui" | "tolak";

// Field `ApiError.fields` yang punya isian di modal; field lain ditampilkan sebagai pesan umum.
const FIELD_AKSI: Record<Aksi, readonly string[]> = {
  setujui: ["poin", "namaLokasi"],
  tolak: ["alasan"],
};

const VARIAN_STATUS: Record<StatusLaporan, VarianBadge> = {
  BELUM_DIPERIKSA: "peringatan",
  VALID: "sukses",
  TIDAK_VALID: "bahaya",
};

const FOKUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal";

// Tombol mode tolak muncul di posisi tombol "Tolak", jadi klik kedua dari klik ganda pada "Tolak"
// jatuh ke tombol baru itu. Klik tersebut diabaikan; tanpanya ReportIt (alasan opsional)
// langsung ditolak. `detail` = 0 untuk klik lewat keyboard.
function klikGanda(e: MouseEvent<HTMLButtonElement>): boolean {
  return e.detail > 1;
}

export default function LaporanView({ laporan, onTutup, onDiverifikasi }: Props) {
  const [mengirim, setMengirim] = useState(false);

  // cacheComponents menjalankan cleanup saat halaman disembunyikan; kunci tombol dilepas agar
  // modal tidak tertahan saat Operator kembali ke I-07.
  useEffect(() => () => setMengirim(false), []);

  // Modal FE-02 memanggil onTutup lewat ✕, Escape, dan klik latar tanpa melihat status request,
  // jadi penutupan ditolak selama setujui/tolak berjalan agar hasilnya tidak hilang.
  function tutupJikaBoleh() {
    if (!mengirim) onTutup();
  }

  // Modal selalu ter-mount dan dibuka lewat `terbuka` (gotcha StrictMode FE-02). Isinya hanya
  // dirender saat terbuka, jadi detail dan isian mulai baru setiap laporan dibuka.
  return (
    <Modal
      terbuka={laporan !== null}
      onTutup={tutupJikaBoleh}
      label={laporan ? formatIdLaporan(laporan.idLaporan) : undefined}
      judul={laporan?.judul ?? ""}
    >
      {laporan && (
        <IsiDetail
          key={laporan.idLaporan}
          idLaporan={laporan.idLaporan}
          mengirim={mengirim}
          setMengirim={setMengirim}
          onTutup={tutupJikaBoleh}
          onDiverifikasi={onDiverifikasi}
        />
      )}
    </Modal>
  );
}

type PropsIsi = {
  idLaporan: number;
  mengirim: boolean;
  setMengirim: (mengirim: boolean) => void;
  onTutup: () => void;
  onDiverifikasi: () => void;
};

function IsiDetail({ idLaporan, ...props }: PropsIsi) {
  const [state, setState] = useState<StateDetail>({ status: "memuat" });
  const [percobaan, setPercobaan] = useState(0);
  // Tidak ikut dependensi effect: fungsi dari I-07 dibuat ulang setiap render.
  const diverifikasi = useEffectEvent(() => props.onDiverifikasi());

  useEffect(() => {
    const pengendali = new AbortController();
    laporanApi.detail(idLaporan, { signal: pengendali.signal }).then(
      (data) => {
        setState({ status: "siap", data });
        // Sudah diverifikasi Operator lain setelah list I-07 dimuat.
        if (data.status !== "BELUM_DIPERIKSA") diverifikasi();
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const galat = error instanceof ApiError ? error : new ApiError("INTERNAL_ERROR", 0);
        const hilang = galat.code === "NOT_FOUND";
        setState({ status: "gagal", pesan: galat.message, bisaUlang: !hilang });
        if (hilang) diverifikasi();
      },
    );
    return () => pengendali.abort();
  }, [idLaporan, percobaan]);

  if (state.status === "memuat") return <KerangkaDetail />;

  if (state.status === "gagal") {
    return (
      <KotakGagal
        pesan={state.pesan}
        onCobaLagi={
          state.bisaUlang
            ? () => {
                setState({ status: "memuat" });
                setPercobaan((n) => n + 1);
              }
            : undefined
        }
      />
    );
  }

  return <DetailSiap detail={state.data} {...props} />;
}

function DetailSiap({
  detail,
  mengirim,
  setMengirim,
  onTutup,
  onDiverifikasi,
}: Omit<PropsIsi, "idLaporan"> & { detail: LaporanDetail }) {
  const menunggu = detail.status === "BELUM_DIPERIKSA";
  const [mode, setMode] = useState<"awal" | "tolak">("awal");
  const [poin, setPoin] = useState<PilihanPoin>(POIN_DEFAULT);
  // K9: nama lokasi baru default = teks lokasi laporan.
  const [namaLokasi, setNamaLokasi] = useState(detail.lokasi);
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<StatusLaporan>(detail.status);
  // `selesai`: laporan tidak bisa diverifikasi lagi dari modal ini; tombol aksi dikunci.
  const [selesai, setSelesai] = useState(!menunggu);
  const [pesan, setPesan] = useState<{ berhasil: boolean; teks: string } | null>(
    menunggu ? null : { berhasil: false, teks: pesanError("SUDAH_DIVERIFIKASI") },
  );
  const kunci = useRef(false);

  const reportIt = detail.jenis === "REPORTIT";
  const terkunci = selesai || mengirim;

  async function kirim(aksi: Aksi) {
    if (kunci.current || selesai) return;
    const isian = { poin, namaLokasi };
    const salah = aksi === "setujui" ? cekIsianSetujui(detail, isian) : cekAlasanTolak(detail.jenis, alasan);
    setGalat(salah);
    setPesan(null);
    if (Object.keys(salah).length > 0) return;

    // Ref mengunci klik ganda sebelum render berikutnya menonaktifkan tombol.
    kunci.current = true;
    setMengirim(true);
    try {
      let teks: string;
      if (aksi === "setujui") {
        const respons = await laporanApi.setujui(detail.idLaporan, bodySetujui(detail, isian));
        teks = pesanSetujui(detail, respons);
        setStatus("VALID");
      } else {
        await laporanApi.tolak(detail.idLaporan, bodyTolak(alasan));
        teks = "Laporan ditolak. Pelapor akan menerima notifikasi.";
        setStatus("TIDAK_VALID");
      }
      setSelesai(true);
      setPesan({ berhasil: true, teks });
      onDiverifikasi();
    } catch (error) {
      const galatApi = error instanceof ApiError ? error : new ApiError("INTERNAL_ERROR", 0);
      const tindakan = tindakanGagalVerifikasi(galatApi.code);
      const fieldIsian = Object.fromEntries(
        Object.entries(galatApi.fields ?? {}).filter(([nama]) => FIELD_AKSI[aksi].includes(nama)),
      );
      if (tindakan === "isian" && Object.keys(fieldIsian).length > 0) {
        setGalat(fieldIsian);
      } else {
        setPesan({ berhasil: false, teks: galatApi.message });
        if (tindakan === "selesai") {
          setSelesai(true);
          onDiverifikasi();
        }
      }
    } finally {
      kunci.current = false;
      setMengirim(false);
    }
  }

  function gantiMode(baru: "awal" | "tolak") {
    setGalat({});
    setPesan(null);
    setMode(baru);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-h3 text-dark-teal">Detail Laporan</h3>
        <Badge varian={VARIAN_STATUS[status]} titik>
          {LABEL_STATUS[status]}
        </Badge>
      </div>

      <InfoLaporan detail={detail} />

      {detail.pelaporAsalSama && (
        <TandaRelawan nama={detail.pelapor.nama} jumlah={detail.jumlahBersihkanSendiri30Hari ?? 0} />
      )}

      {reportIt ? (
        <BagianGaleri judul="Foto Bukti" media={detail.media} lokasi={detail.lokasi} />
      ) : (
        // N9: Sebelum = media laporan asal lokasi, Sesudah = media CleanIt ini.
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BagianGaleri
            judul="Sebelum"
            keterangan={
              detail.laporanAsal
                ? `${formatIdLaporan(detail.laporanAsal.idLaporan)} · ${detail.laporanAsal.judul}`
                : "Laporan asal tidak tersedia"
            }
            media={detail.laporanAsal?.media ?? []}
            lokasi={detail.lokasi}
            satuKolom
          />
          <BagianGaleri
            judul="Sesudah"
            keterangan="Bukti pembersihan dari pelapor"
            media={detail.media}
            lokasi={detail.lokasi}
            satuKolom
          />
        </div>
      )}

      {!selesai && mode === "awal" && reportIt && (
        <section aria-label="Isian persetujuan" className="flex flex-col gap-3">
          {detail.lokasiTerdekat && (
            <p className="rounded-card border border-sky-blue bg-sky-blue/20 p-3 text-sm text-ink">
              <strong className="font-semibold">
                Akan digabung ke {detail.lokasiTerdekat.nama} ({formatJarak(detail.lokasiTerdekat.jarakMeter)})
              </strong>
              . Lokasi TERCEMAR dalam radius 50 m sudah ada, jadi poin dan nama lokasi di bawah tidak dipakai.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <Dropdown
              label="Poin lokasi"
              ukuranLabel="ringkas"
              value={poin}
              onChange={(e) => setPoin(PILIHAN_POIN.find((p) => p === Number(e.target.value)) ?? POIN_DEFAULT)}
              pilihan={PILIHAN_POIN.map((p) => ({ nilai: p, label: `${p} poin` }))}
              disabled={terkunci || detail.lokasiTerdekat !== null}
              error={galat.poin}
            />
            <Textbox
              label="Nama lokasi"
              ukuranLabel="ringkas"
              wajib
              value={namaLokasi}
              onChange={(e) => setNamaLokasi(e.target.value)}
              maxLength={MAKS_NAMA_LOKASI}
              disabled={terkunci || detail.lokasiTerdekat !== null}
              error={galat.namaLokasi}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Poin diberikan kepada relawan yang kelak membersihkan lokasi ini. Pelapor ReportIt tidak
            mendapat poin.
          </p>
        </section>
      )}

      {!selesai && mode === "tolak" && (
        <Textarea
          label="Alasan penolakan"
          ukuranLabel="ringkas"
          wajib={!reportIt}
          rows={3}
          autoFocus
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          disabled={terkunci}
          error={galat.alasan}
          petunjuk={
            reportIt
              ? "Opsional. Pelapor melihat alasan ini di notifikasinya."
              : "Pelapor melihat alasan ini di notifikasinya."
          }
        />
      )}

      {pesan && (
        <p
          role={pesan.berhasil ? "status" : "alert"}
          className={cn(
            "rounded-card p-3 text-sm",
            pesan.berhasil ? "bg-light-green/40 text-dark-teal" : "bg-danger-bg text-danger-text",
          )}
        >
          {pesan.teks}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {mode === "tolak" && !selesai ? (
          <>
            <Button
              varian="bahaya"
              memuat={mengirim}
              onClick={(e) => {
                if (!klikGanda(e)) kirim("tolak");
              }}
              className="flex-1 sm:flex-none"
            >
              {mengirim ? "Memproses…" : "Tolak laporan"}
            </Button>
            <Button
              varian="sekunder"
              disabled={terkunci}
              onClick={(e) => {
                if (!klikGanda(e)) gantiMode("awal");
              }}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button memuat={mengirim} disabled={selesai} onClick={() => kirim("setujui")} className="flex-1 sm:min-w-32 sm:flex-none">
              {mengirim ? "Memproses…" : "Setujui"}
            </Button>
            <Button varian="bahaya" disabled={terkunci} onClick={() => gantiMode("tolak")} className="flex-1 sm:min-w-32 sm:flex-none">
              Tolak
            </Button>
          </>
        )}
        {selesai && (
          <Button varian="sekunder" onClick={onTutup} className="w-full sm:ml-auto sm:w-auto">
            Tutup
          </Button>
        )}
      </div>
    </>
  );
}

function InfoLaporan({ detail }: { detail: LaporanDetail }) {
  const reportIt = detail.jenis === "REPORTIT";
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <KotakInfo label="Lokasi">
        <span className="break-words">{detail.lokasi}</span>
        <a
          href={urlPeta(detail.latitude, detail.longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("w-fit rounded text-sm text-text-secondary underline underline-offset-2 hover:text-dark-teal", FOKUS)}
        >
          {formatKoordinat(detail.latitude, detail.longitude)} · Buka peta
        </a>
      </KotakInfo>
      <KotakInfo label={reportIt ? "Waktu kejadian" : "Waktu pembersihan"}>
        <time dateTime={detail.waktu}>{formatWaktuLengkap(detail.waktu)}</time>
      </KotakInfo>
      {detail.sumber && <KotakInfo label="Sumber Laporan">{LABEL_SUMBER[detail.sumber]}</KotakInfo>}
      <KotakInfo label="Jenis sampah">{LABEL_JENIS_SAMPAH[detail.jenisSampah]}</KotakInfo>
      <KotakInfo label="Pelapor">
        <span className="break-words">{detail.pelapor.nama}</span>
      </KotakInfo>
      <KotakInfo label="Dikirim">
        <time dateTime={detail.createdAt}>{formatWaktuLengkap(detail.createdAt)}</time>
      </KotakInfo>
      {detail.alasanPenolakan && (
        <KotakInfo label="Alasan penolakan" lebar>
          <span className="break-words">{detail.alasanPenolakan}</span>
        </KotakInfo>
      )}
    </dl>
  );
}

function KotakInfo({ label, lebar, children }: { label: string; lebar?: boolean; children: ReactNode }) {
  return (
    <Card varian="lembut" className={cn("min-w-0 gap-1", lebar && "sm:col-span-2")}>
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="flex flex-col gap-1 text-dark-teal">{children}</dd>
    </Card>
  );
}

function TandaRelawan({ nama, jumlah }: { nama: string; jumlah: number }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-card bg-warning-bg p-4 text-sm text-warning-text">
      <Badge varian="netral">Pelapor = Relawan</Badge>
      <p>
        {nama} juga pelapor asal lokasi ini.{" "}
        {jumlah > 0
          ? `Dalam 30 hari terakhir ia sudah ${jumlah.toLocaleString("id-ID")} kali mengirim CleanIt untuk lokasi laporannya sendiri, di luar laporan ini.`
          : "Belum ada CleanIt lain darinya untuk lokasi laporannya sendiri dalam 30 hari terakhir."}{" "}
        Bandingkan foto Sebelum dan Sesudah dengan teliti.
      </p>
    </div>
  );
}

function BagianGaleri({
  judul,
  keterangan,
  media,
  lokasi,
  satuKolom = false,
}: {
  judul: string;
  keterangan?: string;
  media: Media[];
  lokasi: string;
  satuKolom?: boolean;
}) {
  return (
    <section aria-label={judul} className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h4 className="font-heading font-semibold text-dark-teal">{judul}</h4>
        {keterangan && <p className="break-words text-xs text-text-secondary">{keterangan}</p>}
      </div>
      {media.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-4 text-sm text-text-secondary">
          Tidak ada media.
        </p>
      ) : (
        <ul className={cn("grid grid-cols-1 gap-3", !satuKolom && "sm:grid-cols-2")}>
          {media.map((m, i) => {
            const nama = `${judul} ${i + 1} dari ${media.length}`;
            return (
              <li key={m.idMedia}>
                <figure className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
                  {/* object-contain: bukti ditampilkan utuh tanpa terpotong agar bisa dibandingkan. */}
                  {m.tipe === "VIDEO" ? (
                    <video src={m.url} controls preload="metadata" aria-label={nama} className="aspect-[4/3] w-full bg-ink" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- presigned URL dari storage BE-07
                    <img src={m.url} alt={nama} loading="lazy" className="aspect-[4/3] w-full bg-border/40 object-contain" />
                  )}
                  <figcaption className="break-words px-3 py-2 text-xs text-text-secondary">
                    {formatWaktuUnggah(m.createdAt)} • {lokasi}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function KerangkaDetail() {
  return (
    <div aria-busy="true" aria-label="Memuat detail laporan" className="flex animate-pulse flex-col gap-4">
      <div className="h-7 w-40 rounded bg-border" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 rounded-card bg-border" />
        ))}
      </div>
      <div className="aspect-[4/3] w-full rounded-card bg-border sm:w-1/2" />
    </div>
  );
}

/**
 * Bottom sheet konfirmasi penukaran (I-05) yang tampil di atas Halaman Hadiah.
 * Kelas DPPL: C12 - HalamanPenukaran (pilihReward)
 */
"use client";

import { BottomSheet, Button } from "@/components/ui";
import { WARNA_JENIS, labelJenis } from "@/lib/reward";
import type { Reward } from "@/types/api";

type Props = {
  /** null = sheet tertutup. */
  reward: Reward | null;
  saldoPoin: number;
  mengirim: boolean;
  pesanGagal: string | null;
  onBatal: () => void;
  onTukarkan: () => void;
};

const format = (n: number) => n.toLocaleString("id-ID");

export default function KonfirmasiPenukaran({
  reward,
  saldoPoin,
  mengirim,
  pesanGagal,
  onBatal,
  onTukarkan,
}: Props) {
  // useDialog FE-02 memanggil onTutup saat Escape/klik latar tanpa melihat status request,
  // jadi penutupan ditolak di sini selama request berjalan agar hasilnya tidak hilang.
  function tutupJikaBoleh() {
    if (!mengirim) onBatal();
  }

  // Sheet selalu ter-mount dan dibuka lewat `terbuka`. Jika di-mount langsung dalam keadaan
  // terbuka, StrictMode (dev) menjalankan efek buka-tutup-buka dan event `close` yang tertunda
  // dianggap useDialog sebagai penutupan oleh pengguna, sehingga sheet langsung tertutup.
  return (
    <BottomSheet
      terbuka={reward !== null}
      onTutup={tutupJikaBoleh}
      judul="Konfirmasi penukaran"
      aksi={
        <>
          <Button varian="sekunder" disabled={mengirim} onClick={onBatal}>
            Batal
          </Button>
          <Button memuat={mengirim} onClick={onTukarkan}>
            {mengirim ? "Memproses…" : "Tukarkan"}
          </Button>
        </>
      }
    >
      {reward && <IsiKonfirmasi reward={reward} saldoPoin={saldoPoin} />}

      {pesanGagal && (
        <p role="alert" className="rounded-card bg-danger-bg p-3 text-sm text-danger-text">
          {pesanGagal}
        </p>
      )}
    </BottomSheet>
  );
}

function IsiKonfirmasi({ reward, saldoPoin }: { reward: Reward; saldoPoin: number }) {
  // I05-05: hanya pratinjau; sisa poin sebenarnya dihitung server (BE-21).
  const sisaPoin = saldoPoin - reward.hargaPoin;

  return (
    <>
      <div className={`rounded-card p-4 ${WARNA_JENIS[reward.jenis] ?? "bg-border/40"}`}>
        <p className="text-xs">
          {labelJenis(reward.jenis)} · Stok {format(reward.stok)}
        </p>
        <p className="break-words font-heading font-bold">{reward.nama}</p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt>Poin Anda</dt>
          <dd className="font-medium">{format(saldoPoin)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Harga reward</dt>
          <dd className="font-medium">−{format(reward.hargaPoin)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <dt className="font-bold">Sisa poin</dt>
          <dd className="font-heading text-h2 text-dark-teal">{format(sisaPoin)}</dd>
        </div>
      </dl>

      <p className="text-xs text-text-secondary">Poin yang sudah ditukarkan tidak dapat dikembalikan.</p>
    </>
  );
}

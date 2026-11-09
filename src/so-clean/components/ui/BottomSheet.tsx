/**
 * Bottom Sheet (FE-02). Sumber: "Dialog" Konfirmasi penukaran (97:582) dan "Alertdialog"
 * Poin tidak cukup (97:655) untuk I-05.
 *
 * Panel yang naik dari bawah layar. Di layar lebar, lebarnya dibatasi seperti layar HP
 * (440px) dan tetap menempel di bawah. Tutup lewat Escape, klik latar, atau tombol aksi
 * yang memanggil `onTutup`.
 *
 * Contoh:
 *   <BottomSheet terbuka={reward !== null} onTutup={() => setReward(null)}
 *                judul="Konfirmasi penukaran"
 *                aksi={<>
 *                  <Button varian="sekunder" lebarPenuh onClick={() => setReward(null)}>Batal</Button>
 *                  <Button lebarPenuh memuat={sedangTukar} onClick={tukar}>Tukarkan</Button>
 *                </>}>
 *     ...ringkasan poin...
 *   </BottomSheet>
 */
"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";
import { useDialog } from "./useDialog";

type Props = {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  children: ReactNode;
  /** Tombol aksi di bagian bawah; tiap anak dibagi rata dalam satu baris. */
  aksi?: ReactNode;
  className?: string;
};

export function BottomSheet({ terbuka, onTutup, judul, children, aksi, className }: Props) {
  const { ref, klikLatar } = useDialog(terbuka, onTutup);

  return (
    <dialog
      ref={ref}
      onClick={klikLatar}
      aria-label={judul}
      className={cn(
        "mx-auto mt-auto mb-0 w-full max-w-[440px] max-h-[90dvh] overflow-y-auto",
        "rounded-t-sheet bg-white p-0 text-ink shadow-xl",
        "backdrop:bg-ink/40 open:animate-naik",
        className,
      )}
    >
      {terbuka && (
        <div className="flex flex-col gap-4 px-6 pt-3 pb-6">
          <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-border" />
          <h2 className="font-heading text-xl font-bold">{judul}</h2>
          <div className="flex flex-col gap-4">{children}</div>
          {aksi && <footer className="flex gap-3 *:flex-1">{aksi}</footer>}
        </div>
      )}
    </dialog>
  );
}

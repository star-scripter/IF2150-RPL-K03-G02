/**
 * Modal (FE-02). Sumber: modal "Detail Laporan" di Figma (Frame 4, 107:4980) untuk I-08.
 *
 * Jendela di tengah layar dengan latar digelapkan. Tutup lewat tombol ✕, Escape, atau klik
 * latar; semuanya memanggil `onTutup`, jadi status buka/tutup tetap dipegang pemanggil.
 *
 * Contoh:
 *   <Modal terbuka={idDibuka !== null} onTutup={() => setIdDibuka(null)}
 *          label="RPT-0248" judul="Sampah plastik di Sungai Cikapundung"
 *          aksi={<><Button>Setujui</Button><Button varian="bahaya">Tolak</Button></>}>
 *     ...detail laporan...
 *   </Modal>
 */
"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";
import { useDialog } from "./useDialog";

type Props = {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  /** Teks kecil di atas judul, mis. ID laporan "RPT-0248". */
  label?: string;
  children: ReactNode;
  /** Tombol aksi di bagian bawah. */
  aksi?: ReactNode;
  className?: string;
};

export function Modal({ terbuka, onTutup, judul, label, children, aksi, className }: Props) {
  const { ref, propsLatar } = useDialog(terbuka, onTutup);

  return (
    <dialog
      ref={ref}
      {...propsLatar}
      aria-label={judul}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto",
        "rounded-card border border-border bg-white p-0 text-ink shadow-xl",
        "backdrop:bg-ink/40 open:animate-muncul",
        className,
      )}
    >
      {/* Render isi hanya saat terbuka agar state di dalamnya mulai baru setiap kali dibuka. */}
      {terbuka && (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {label && <p className="text-xs text-text-secondary">{label}</p>}
              <h2 className="text-h3 text-dark-teal">{judul}</h2>
            </div>
            <button
              type="button"
              onClick={onTutup}
              aria-label="Tutup"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-h3 leading-none text-text-secondary hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-dark-teal"
            >
              ✕
            </button>
          </header>
          <div className="flex flex-col gap-4">{children}</div>
          {aksi && <footer className="flex flex-wrap gap-3">{aksi}</footer>}
        </div>
      )}
    </dialog>
  );
}

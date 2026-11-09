/**
 * Progress Indicator (FE-02), dua bentuk:
 *
 * 1. `ProgressLangkah` — penanda langkah form multi-step. Sumber: "Step progress" (108:267,
 *    108:324, 108:389) di Form Laporan I-11 → I-12 → I-13. Langkah selesai bertanda ✓.
 * 2. `ProgressBar` — bilah kemajuan, mis. progress upload media (FE-11). Sumber: bilah poin di
 *    "Alertdialog" (97:663).
 *
 * Contoh:
 *   <ProgressLangkah langkah={["Informasi Dasar", "Bukti Media", "Tinjau & Kirim"]} aktif={1} />
 *   <ProgressBar nilai={persenUpload} label="Mengunggah foto" />
 */
import { cn } from "./cn";

type PropsLangkah = {
  /** Nama tiap langkah, berurutan. */
  langkah: readonly string[];
  /** Indeks langkah aktif, mulai dari 0. */
  aktif: number;
  className?: string;
};

export function ProgressLangkah({ langkah, aktif, className }: PropsLangkah) {
  return (
    <ol
      aria-label={`Langkah ${aktif + 1} dari ${langkah.length}`}
      className={cn("flex w-full items-start justify-center gap-1 bg-white px-5 pt-2 pb-2", className)}
    >
      {langkah.map((nama, i) => {
        const selesai = i < aktif;
        const sekarang = i === aktif;
        return (
          <li
            key={nama}
            aria-current={sekarang ? "step" : undefined}
            className="flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                selesai || sekarang
                  ? "bg-emerald text-white"
                  : "border-[1.5px] border-border bg-white text-text-secondary",
              )}
            >
              <span aria-hidden>{selesai ? "✓" : i + 1}</span>
            </span>
            <span
              className={cn(
                "text-[10px] leading-[1.35]",
                sekarang ? "font-semibold text-dark-teal" : "font-medium text-text-secondary",
              )}
            >
              {selesai && <span className="sr-only">Selesai: </span>}
              {nama}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type PropsBar = {
  /** 0–100; nilai di luar rentang dipotong. */
  nilai: number;
  /** Nama untuk pembaca layar, mis. "Mengunggah foto". */
  label: string;
  /** Tampilkan persen di kanan bilah. */
  tampilkanPersen?: boolean;
  className?: string;
};

export function ProgressBar({ nilai, label, tampilkanPersen = false, className }: PropsBar) {
  const persen = Math.round(Math.min(100, Math.max(0, nilai)));
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={persen}
        className="h-2 flex-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-emerald transition-[width] duration-200"
          style={{ width: `${persen}%` }}
        />
      </div>
      {tampilkanPersen && (
        <span className="w-10 text-right text-sm tabular-nums text-text-secondary">{persen}%</span>
      )}
    </div>
  );
}

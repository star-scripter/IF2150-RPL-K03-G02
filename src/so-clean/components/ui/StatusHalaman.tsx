/**
 * State umum halaman (FE-25): kotak gagal dengan tombol "Coba lagi" dan kotak kosong,
 * agar error dan empty state di semua halaman seragam.
 */
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { cn } from "./cn";

type PropsGagal = {
  pesan: string;
  /** Kosongkan bila percobaan ulang tidak berguna, mis. laporan sudah tidak ada. */
  onCobaLagi?: () => void;
  className?: string;
};

export function KotakGagal({ pesan, onCobaLagi, className }: PropsGagal) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-start gap-3 rounded-card bg-danger-bg p-4 text-sm text-danger-text", className)}
    >
      <p className="break-words">{pesan}</p>
      {onCobaLagi && (
        <Button varian="bahaya" onClick={onCobaLagi}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

type PropsKosong = {
  judul: string;
  keterangan?: string;
  /** Tombol aksi opsional, mis. "Lihat Hadiah" atau "Muat ulang". */
  aksi?: ReactNode;
  className?: string;
};

export function KotakKosong({ judul, keterangan, aksi, className }: PropsKosong) {
  return (
    <Card varian="lembut" className={cn("items-center py-8 text-center", className)}>
      <p className="font-semibold text-ink">{judul}</p>
      {keterangan && <p className="text-sm text-text-secondary">{keterangan}</p>}
      {aksi}
    </Card>
  );
}

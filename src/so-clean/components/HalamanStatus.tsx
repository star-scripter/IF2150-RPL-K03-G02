/**
 * Kerangka halaman status (FE-25) untuk 404 dan error tak terduga: header logo SoClean dan
 * pesan di kolom selebar HP. Dipakai `app/not-found.tsx`, `app/error.tsx`, dan
 * `app/global-error.tsx` yang berada di luar layout group, jadi header dibuat sendiri.
 */
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

type Props = {
  judul: string;
  keterangan: string;
  /** Tombol aksi, mis. "Coba lagi" dan "Ke halaman awal". */
  children: ReactNode;
};

export function HalamanStatus({ judul, keterangan, children }: Props) {
  return (
    <div className="flex flex-1 justify-center bg-surface">
      <div className="flex w-full max-w-[440px] flex-col bg-white">
        <header className="bg-dark-teal px-4 py-3.5 min-[400px]:px-8">
          <div className="flex h-[68px] items-center">
            <Logo />
          </div>
        </header>
        <main className="flex flex-1 flex-col justify-center gap-6 px-4 py-10 text-center min-[400px]:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-h2 text-dark-teal">{judul}</h1>
            <p className="text-body text-text-secondary">{keterangan}</p>
          </div>
          <div className="flex flex-col gap-3">{children}</div>
        </main>
      </div>
    </div>
  );
}

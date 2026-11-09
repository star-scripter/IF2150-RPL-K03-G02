/**
 * Kotak kode voucher dengan tombol salin (I06-03/04), dipakai juga di riwayat penukaran (FE-21).
 * Kelas DPPL: C12 - HalamanPenukaran
 */
"use client";

import { notify } from "@/components/ui";

// Clipboard API hanya ada di secure context (HTTPS atau localhost); di luar itu
// `navigator.clipboard` undefined dan penyalinan dianggap gagal.
async function salinTeks(teks: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(teks);
    return true;
  } catch {
    return false;
  }
}

type Props = {
  kode: string;
};

export default function KodeVoucher({ kode }: Props) {
  async function salin() {
    if (await salinTeks(kode)) notify.sukses("Kode voucher disalin");
    else notify.gagal("Gagal menyalin kode");
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-card bg-sky-blue px-4 py-3">
      <span className="select-all font-heading text-lg font-bold tracking-wide text-ink">{kode}</span>
      <button
        type="button"
        onClick={salin}
        aria-label="Salin kode voucher"
        className="grid size-10 place-items-center rounded-button text-ink hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      </button>
    </div>
  );
}

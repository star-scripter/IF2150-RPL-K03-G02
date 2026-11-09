/**
 * Pagination (FE-02). Sumber: "Navigasi halaman" (62:392) di Validator laporan (I-07).
 *
 * Menerima `meta` dari respons list kontrak (`GET /api/laporan`, `GET /api/penukaran`) dan
 * memanggil `onUbah(halaman)` saat pengguna pindah halaman; pemanggil yang mengambil data baru.
 *
 * Contoh:
 *   const { data, meta } = await laporanApi.daftar({ page, jenis: "REPORTIT" });
 *   <Pagination meta={meta} onUbah={setPage} satuan="laporan" />
 */
"use client";

import type { PaginationMeta } from "@/types/api";
import { cn } from "./cn";
import { daftarHalaman, jumlahHalaman, rentangItem } from "./pagination-utils";

type Props = {
  meta: PaginationMeta;
  onUbah: (halaman: number) => void;
  /** Kata benda untuk ringkasan, mis. "laporan" → "Menampilkan 1–6 dari 12 laporan". */
  satuan?: string;
  className?: string;
};

const KELAS_PANAH =
  "flex size-[34px] items-center justify-center rounded-lg enabled:hover:bg-surface " +
  "disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-dark-teal";

export function Pagination({ meta, onUbah, satuan = "data", className }: Props) {
  const total = jumlahHalaman(meta);
  const rentang = rentangItem(meta);
  const halaman = daftarHalaman(meta.page, total);

  return (
    <nav
      aria-label="Navigasi halaman"
      className={cn(
        "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
        className,
      )}
    >
      <p className="text-[13px] text-text-secondary" aria-live="polite">
        {rentang
          ? `Menampilkan ${rentang.dari}–${rentang.sampai} dari ${meta.total} ${satuan}`
          : `Tidak ada ${satuan}`}
      </p>

      {total > 1 && (
        <ul className="flex items-center gap-2">
          <li>
            <button
              type="button"
              className={KELAS_PANAH}
              disabled={meta.page <= 1}
              onClick={() => onUbah(meta.page - 1)}
              aria-label="Halaman sebelumnya"
            >
              {/* Aset chevron dari Figma (62:426); diputar untuk arah kiri. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/chevron-right.svg" alt="" width={18} height={18} className="rotate-180" />
            </button>
          </li>
          {halaman.map((item, i) =>
            item === "elipsis" ? (
              <li key={`elipsis-${i}`} aria-hidden className="w-5 text-center text-[13px] text-text-secondary">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onUbah(item)}
                  aria-current={item === meta.page ? "page" : undefined}
                  aria-label={`Halaman ${item}`}
                  className={cn(
                    "flex size-[34px] items-center justify-center rounded-lg text-[13px]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-teal",
                    item === meta.page
                      ? "bg-dark-teal font-semibold text-white"
                      : "text-dark-teal hover:bg-surface",
                  )}
                >
                  {item}
                </button>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              className={KELAS_PANAH}
              disabled={meta.page >= total}
              onClick={() => onUbah(meta.page + 1)}
              aria-label="Halaman berikutnya"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/chevron-right.svg" alt="" width={18} height={18} />
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}

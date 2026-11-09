/**
 * Toast (FE-02): notifikasi singkat di atas layar, dipanggil lewat `notify(...)`.
 * Figma belum punya desain toast; warnanya memakai token (sukses = dark teal, gagal = merah,
 * info = sky blue).
 *
 * `<Toaster />` dipasang sekali di `app/layout.tsx`. Daftar toast ditampilkan sebagai popover
 * (top layer) dan dibuka ulang setiap ada toast baru, supaya tetap terlihat di atas Modal atau
 * Bottom Sheet yang sedang terbuka (mis. pesan STOK_HABIS saat konfirmasi penukaran).
 *
 * Contoh:
 *   import { notify } from "@/components/ui/Toast";
 *   notify.sukses("Penukaran berhasil");
 *   notify.gagal("Gagal mengunggah media");
 */
"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "./cn";
import {
  ambilDaftarToast,
  ambilDaftarToastServer,
  langganan,
  tutupToast,
  type JenisToast,
} from "./toast-store";

export { notify, tutupToast } from "./toast-store";
export type { JenisToast, OpsiToast } from "./toast-store";

const KELAS_JENIS: Record<JenisToast, string> = {
  sukses: "bg-dark-teal text-white",
  gagal: "bg-danger-text text-white",
  info: "bg-sky-blue text-ink",
};

const IKON: Record<JenisToast, string> = { sukses: "✓", gagal: "!", info: "i" };

export function Toaster() {
  const daftar = useSyncExternalStore(langganan, ambilDaftarToast, ambilDaftarToastServer);
  const ref = useRef<HTMLDivElement>(null);
  const jumlah = daftar.length;
  const idTerakhir = daftar.at(-1)?.id;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    if (el.matches(":popover-open")) el.hidePopover();
    // Dibuka ulang agar berada di atas dialog yang dibuka setelah toast sebelumnya.
    if (jumlah > 0) el.showPopover();
  }, [jumlah, idTerakhir]);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-4 bottom-auto m-0 mx-auto w-[calc(100%-2rem)] max-w-[400px]",
        "overflow-visible border-0 bg-transparent p-0",
        "flex-col gap-2 [&:popover-open]:flex",
      )}
    >
      {daftar.map((t) => (
        <div
          key={t.id}
          role={t.jenis === "gagal" ? "alert" : "status"}
          className={cn(
            "flex animate-muncul items-start gap-3 rounded-card px-4 py-3 text-sm shadow-lg",
            KELAS_JENIS[t.jenis],
          )}
        >
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold"
          >
            {IKON[t.jenis]}
          </span>
          <p className="flex-1 leading-5">{t.pesan}</p>
          <button
            type="button"
            onClick={() => tutupToast(t.id)}
            aria-label="Tutup notifikasi"
            className="shrink-0 leading-5 opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

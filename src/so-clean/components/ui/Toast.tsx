/**
 * Toast (FE-02): notifikasi singkat di atas layar, dipanggil lewat `notify(...)`.
 * Figma belum punya desain toast; warnanya memakai token (sukses = dark teal, gagal = merah,
 * info = sky blue).
 *
 * `<Toaster />` dipasang sekali di `app/layout.tsx`. Saat Modal atau Bottom Sheet terbuka,
 * `showModal()` membuat semua elemen di luar dialog menjadi inert: tidak bisa diklik dan tidak
 * terbaca pembaca layar. Karena itu toast dirender (portal) di dalam dialog teratas jika ada,
 * dan di `document.body` jika tidak, mis. pesan STOK_HABIS saat konfirmasi penukaran tetap
 * bisa dibaca dan ditutup. Toast di dalam dialog tidak ikut menutup dialog saat diklik.
 *
 * Contoh:
 *   import { notify } from "@/components/ui/Toast";
 *   notify.sukses("Penukaran berhasil");
 *   notify.gagal("Gagal mengunggah media");
 */
"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";
import { dialogTeratas, dialogTeratasServer, langgananDialog } from "./dialog-store";
import {
  ambilDaftarToast,
  ambilDaftarToastServer,
  langganan,
  tutupToast,
  type JenisToast,
  type Toast,
} from "./toast-store";

export { notify, tutupToast } from "./toast-store";
export type { JenisToast, OpsiToast } from "./toast-store";

const KELAS_JENIS: Record<JenisToast, string> = {
  sukses: "bg-dark-teal text-white",
  gagal: "bg-danger-text text-white",
  info: "bg-sky-blue text-ink",
};

const IKON: Record<JenisToast, string> = { sukses: "✓", gagal: "!", info: "i" };

const tanpaLangganan = () => () => {};

export function Toaster() {
  const daftar = useSyncExternalStore(langganan, ambilDaftarToast, ambilDaftarToastServer);
  const dialog = useSyncExternalStore(langgananDialog, dialogTeratas, dialogTeratasServer);
  // Portal butuh `document`; di server (dan render hidrasi pertama) tidak merender apa pun.
  const diKlien = useSyncExternalStore(tanpaLangganan, () => true, () => false);
  if (!diKlien) return null;

  // Portal ke wadah lain (dialog dibuka/ditutup) membuat WadahToast baru, yang dibuka sekali.
  return createPortal(<WadahToast daftar={daftar} />, dialog ?? document.body);
}

/**
 * Wadah toast berupa popover `manual`, dibuka sekali saat dipasang. Sebagai popover, wadah ada
 * di top layer: posisinya terhadap layar (tidak ikut `transform` animasi dialog) dan berada di
 * atas dialog yang dibuka sebelumnya. Karena wadah adalah turunan dialog teratas, ia tidak
 * terkena inert. Wadah tidak pernah ditutup-buka ulang, jadi animasi toast tidak terulang.
 */
function WadahToast({ daftar }: { daftar: readonly Toast[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && typeof el.showPopover === "function" && !el.matches(":popover-open")) {
      el.showPopover();
    }
  }, []);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-4 bottom-auto m-0 mx-auto w-[calc(100%-2rem)] max-w-[400px]",
        "overflow-visible border-0 bg-transparent p-0",
        "flex-col gap-2 [&:popover-open]:flex",
      )}
    >
      {daftar.map((t) => (
        <div
          key={t.id}
          role={t.jenis === "gagal" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex animate-muncul items-start gap-3 rounded-card px-4 py-3 text-sm shadow-lg",
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
            className="shrink-0 leading-5 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

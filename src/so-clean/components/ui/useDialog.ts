/**
 * Perilaku bersama Modal dan BottomSheet (FE-02), memakai elemen `<dialog>` bawaan browser:
 * `showModal()` sudah mengunci fokus di dalam dialog, menaruhnya di atas semua elemen, dan
 * membuat halaman di belakangnya tidak bisa diklik.
 *
 * Hook ini menambahkan: buka/tutup dari prop `terbuka`, Escape dan klik latar → `onTutup`,
 * serta mengunci scroll halaman selama dialog terbuka.
 */
"use client";

import { useEffect, useRef, type MouseEvent } from "react";

export function useDialog(terbuka: boolean, onTutup: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  // Simpan callback terbaru tanpa membuat ulang listener setiap render.
  const tutupRef = useRef(onTutup);
  useEffect(() => {
    tutupRef.current = onTutup;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (terbuka && !dialog.open) dialog.showModal();
    if (!terbuka && dialog.open) dialog.close();
  }, [terbuka]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Escape memicu "cancel"; tutup lewat state pemanggil agar prop `terbuka` tetap sinkron.
    const batal = (e: Event) => {
      e.preventDefault();
      tutupRef.current();
    };
    dialog.addEventListener("cancel", batal);
    return () => dialog.removeEventListener("cancel", batal);
  }, []);

  useEffect(() => {
    if (!terbuka) return;
    const html = document.documentElement;
    const sebelumnya = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = sebelumnya;
    };
  }, [terbuka]);

  /** Pasang di `<dialog onClick>`: klik di latar (di luar isi) menutup dialog. */
  const klikLatar = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) tutupRef.current();
  };

  return { ref, klikLatar };
}

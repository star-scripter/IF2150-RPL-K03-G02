/**
 * Perilaku bersama Modal dan BottomSheet (FE-02), memakai elemen `<dialog>` bawaan browser:
 * `showModal()` sudah mengunci fokus di dalam dialog, menaruhnya di atas semua elemen, dan
 * membuat halaman di belakangnya tidak bisa diklik.
 *
 * Hook ini menambahkan:
 * - buka/tutup mengikuti prop `terbuka` (status dipegang pemanggil);
 * - Escape dan klik latar → `onTutup`;
 * - sinkronisasi saat browser menutup dialog sendiri tanpa event `cancel` (mis. Escape kedua
 *   yang tidak bisa dibatalkan): `onTutup` dipanggil, dan jika pemanggil tetap `terbuka`
 *   (mis. sedang memuat), dialog dibuka lagi;
 * - kunci scroll halaman berbasis hitungan (aman untuk beberapa dialog sekaligus);
 * - pencatatan dialog teratas agar toast dirender di dalamnya (lihat `dialog-store.ts`).
 */
"use client";

import { useEffect, useReducer, useRef, type MouseEvent, type PointerEvent } from "react";
import { daftarkanDialog, hapusDialog, kunciScroll } from "./dialog-store";

function diLuarKotak(el: Element, x: number, y: number): boolean {
  const kotak = el.getBoundingClientRect();
  return x < kotak.left || x > kotak.right || y < kotak.top || y > kotak.bottom;
}

/** true jika event mengenai latar (::backdrop), bukan isi atau scrollbar dialog. */
function kenaLatar(e: MouseEvent<HTMLDialogElement>): boolean {
  return e.target === e.currentTarget && diLuarKotak(e.currentTarget, e.clientX, e.clientY);
}

export function useDialog(terbuka: boolean, onTutup: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const tutupRef = useRef(onTutup);
  const terbukaRef = useRef(terbuka);
  const tekanDiLatar = useRef(false);
  const [, paksaRender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    tutupRef.current = onTutup;
  });

  // Buka dialog, kunci scroll, dan catat sebagai dialog teratas selama `terbuka`.
  useEffect(() => {
    const dialog = ref.current;
    terbukaRef.current = terbuka;
    if (!dialog || !terbuka) return;
    if (!dialog.open) dialog.showModal();
    daftarkanDialog(dialog);
    const lepasScroll = kunciScroll();
    return () => {
      // Ditandai lebih dulu agar event `close` dari penutupan ini tidak memanggil `onTutup`.
      terbukaRef.current = false;
      hapusDialog(dialog);
      lepasScroll();
      if (dialog.open) dialog.close();
    };
  }, [terbuka]);

  // Setelah browser menutup dialog sendiri dan pemanggil menolak menutup, buka lagi.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && terbuka && !dialog.open) {
      dialog.showModal();
      daftarkanDialog(dialog);
    }
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Escape memicu "cancel"; tutup lewat state pemanggil agar prop `terbuka` tetap sinkron.
    const batal = (e: Event) => {
      e.preventDefault();
      tutupRef.current();
    };
    // "close" tanpa lewat state (mis. Escape kedua yang tidak bisa dibatalkan browser).
    const tertutup = () => {
      if (!terbukaRef.current) return; // ditutup oleh hook ini sendiri
      hapusDialog(dialog);
      tutupRef.current();
      paksaRender();
    };
    dialog.addEventListener("cancel", batal);
    dialog.addEventListener("close", tertutup);
    return () => {
      dialog.removeEventListener("cancel", batal);
      dialog.removeEventListener("close", tertutup);
    };
  }, []);

  /**
   * Pasang di `<dialog {...propsLatar}>`. Dialog hanya ditutup jika tekan DAN lepas terjadi di
   * latar, jadi klik scrollbar atau seleksi teks yang dilepas di latar tidak menutup dialog.
   */
  const propsLatar = {
    onPointerDown: (e: PointerEvent<HTMLDialogElement>) => {
      tekanDiLatar.current = kenaLatar(e);
    },
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      const tutup = tekanDiLatar.current && kenaLatar(e);
      tekanDiLatar.current = false;
      if (tutup) tutupRef.current();
    },
  };

  return { ref, propsLatar };
}

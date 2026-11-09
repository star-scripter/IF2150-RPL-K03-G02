/**
 * Status bersama dialog modal (FE-02), tanpa React:
 *
 * 1. Tumpukan dialog yang sedang terbuka. `showModal()` membuat semua elemen di luar dialog
 *    teratas menjadi inert (tidak bisa diklik dan tidak terbaca pembaca layar), jadi `<Toaster />`
 *    memakai `dialogTeratas()` untuk merender toast di dalam dialog tersebut.
 * 2. Kunci scroll halaman berbasis hitungan: scroll baru dikembalikan setelah dialog terakhir
 *    tertutup, apa pun urutan penutupannya.
 */

let tumpukan: readonly HTMLDialogElement[] = [];
const pendengar = new Set<() => void>();

function ubah(baru: readonly HTMLDialogElement[]): void {
  tumpukan = baru;
  for (const dengar of pendengar) dengar();
}

/** Catat dialog yang baru dibuka sebagai dialog teratas. */
export function daftarkanDialog(dialog: HTMLDialogElement): void {
  if (tumpukan.at(-1) === dialog) return;
  ubah([...tumpukan.filter((d) => d !== dialog), dialog]);
}

/** Hapus dialog yang tertutup. Aman dipanggil berulang. */
export function hapusDialog(dialog: HTMLDialogElement): void {
  if (tumpukan.includes(dialog)) ubah(tumpukan.filter((d) => d !== dialog));
}

/** Untuk `useSyncExternalStore`. */
export function langgananDialog(dengar: () => void): () => void {
  pendengar.add(dengar);
  return () => pendengar.delete(dengar);
}

export function dialogTeratas(): HTMLDialogElement | null {
  return tumpukan.at(-1) ?? null;
}

export function dialogTeratasServer(): null {
  return null;
}

type TargetScroll = { style: { overflow: string } };

/**
 * Buat pengunci scroll untuk `target`. Setiap pemanggilan mengunci dan mengembalikan fungsi
 * pelepas; `overflow` asli dikembalikan hanya saat pelepas terakhir dipanggil.
 */
export function buatKunciScroll(target: TargetScroll): () => () => void {
  let jumlah = 0;
  let sebelumnya = "";
  return () => {
    if (jumlah === 0) {
      sebelumnya = target.style.overflow;
      target.style.overflow = "hidden";
    }
    jumlah++;
    let dilepas = false;
    return () => {
      if (dilepas) return;
      dilepas = true;
      jumlah--;
      if (jumlah === 0) target.style.overflow = sebelumnya;
    };
  };
}

let kunciDokumen: (() => () => void) | null = null;

/** Kunci scroll halaman; panggil fungsi yang dikembalikan untuk melepas. */
export function kunciScroll(): () => void {
  kunciDokumen ??= buatKunciScroll(document.documentElement);
  return kunciDokumen();
}

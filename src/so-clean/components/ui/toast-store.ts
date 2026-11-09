/**
 * Penyimpanan toast (FE-02), tanpa React agar `notify` bisa dipanggil dari mana saja:
 * komponen, handler event, atau kode yang menangani `ApiError`.
 *
 * Tampilannya ada di `components/ui/Toast.tsx` (`<Toaster />`, dipasang sekali di layout).
 *
 * Contoh:
 *   notify("Laporan terkirim", { jenis: "sukses" });
 *   notify.gagal(error.message);
 */

export type JenisToast = "sukses" | "gagal" | "info";

export type Toast = {
  id: number;
  jenis: JenisToast;
  pesan: string;
  /** Milidetik sebelum hilang otomatis; 0 = tetap tampil sampai ditutup. */
  durasi: number;
};

export type OpsiToast = {
  jenis?: JenisToast;
  durasi?: number;
};

/** Toast terlama dibuang jika lebih dari ini, supaya layar HP tidak tertutup. */
export const MAKS_TOAST = 3;
export const DURASI_BAWAAN = 4000;

let daftar: readonly Toast[] = [];
let idBerikut = 1;
const pendengar = new Set<() => void>();

function ubah(baru: readonly Toast[]): void {
  daftar = baru;
  for (const dengar of pendengar) dengar();
}

/** Tutup satu toast. Aman dipanggil untuk id yang sudah hilang. */
export function tutupToast(id: number): void {
  if (daftar.some((t) => t.id === id)) ubah(daftar.filter((t) => t.id !== id));
}

function tampilkan(pesan: string, opsi: OpsiToast = {}): number {
  const toast: Toast = {
    id: idBerikut++,
    jenis: opsi.jenis ?? "info",
    pesan,
    durasi: opsi.durasi ?? DURASI_BAWAAN,
  };
  ubah([...daftar, toast].slice(-MAKS_TOAST));
  if (toast.durasi > 0) setTimeout(() => tutupToast(toast.id), toast.durasi);
  return toast.id;
}

/** Tampilkan toast; mengembalikan id untuk `tutupToast`. */
export const notify = Object.assign(tampilkan, {
  sukses: (pesan: string, durasi?: number) => tampilkan(pesan, { jenis: "sukses", durasi }),
  gagal: (pesan: string, durasi?: number) => tampilkan(pesan, { jenis: "gagal", durasi }),
  info: (pesan: string, durasi?: number) => tampilkan(pesan, { jenis: "info", durasi }),
});

/** Untuk `useSyncExternalStore`. */
export function langganan(dengar: () => void): () => void {
  pendengar.add(dengar);
  return () => pendengar.delete(dengar);
}

export function ambilDaftarToast(): readonly Toast[] {
  return daftar;
}

const KOSONG: readonly Toast[] = [];
export function ambilDaftarToastServer(): readonly Toast[] {
  return KOSONG;
}

/** Hanya untuk test: kosongkan semua toast. */
export function resetToast(): void {
  ubah(KOSONG);
}

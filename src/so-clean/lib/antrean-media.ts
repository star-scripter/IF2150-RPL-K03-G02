import { ApiError } from "@/lib/api/client";
import type { ProgresUnggah } from "@/lib/api/upload-progress";
import type { MediaFormLaporan } from "@/lib/form-laporan";
import { hasilUnggahValid, pesanGagalMedia } from "@/lib/bukti-media";
import type { MediaUploadResponse } from "@/types/api";

export type StatusUnggahan =
  | { status: "menunggu" }
  | { status: "mengunggah"; persen: number | null }
  | { status: "berhasil" }
  | { status: "gagal"; pesan: string; bisaUlang: boolean };
export type SnapshotUnggahan = Readonly<Record<string, StatusUnggahan>>;
type Item = { media: MediaFormLaporan; status: StatusUnggahan; pengendali?: AbortController; jaringanGagal?: boolean };
type Transport = (berkas: File, opsi: { signal: AbortSignal; onUploadProgress: (progres: ProgresUnggah) => void }) => Promise<MediaUploadResponse>;
const KOSONG: SnapshotUnggahan = Object.freeze({});

/** Antrean serial satu form/tab. Tidak menyimpan File ke localStorage atau mengubah byte asli. */
export class AntreanMedia {
  private item = new Map<string, Item>();
  private pendengar = new Set<() => void>();
  private snapshot: SnapshotUnggahan = KOSONG;
  private aktif = false;
  private online = false;

  constructor(private opsi: {
    unggah: Transport;
    berhasil: (id: string, hasil: MediaUploadResponse) => void;
    gagal: (pesan: string) => void;
  }) {}

  ambilSnapshot = () => this.snapshot;
  ambilSnapshotServer = () => KOSONG;
  langganan = (dengar: () => void) => { this.pendengar.add(dengar); return () => { this.pendengar.delete(dengar); }; };

  private umumkan() {
    this.snapshot = Object.fromEntries([...this.item].map(([id, item]) => [id, item.status]));
    this.pendengar.forEach((dengar) => dengar());
  }

  sinkronkan(media: readonly MediaFormLaporan[]) {
    const ids = new Set(media.map((item) => item.idLokal));
    let berubah = false;
    for (const [id, item] of this.item) if (!ids.has(id)) {
      this.item.delete(id); item.pengendali?.abort(); berubah = true;
    }
    for (const data of media) {
      const lama = this.item.get(data.idLokal);
      if (lama && lama.media.berkas === data.berkas) {
        lama.media = data;
        if (data.unggahan && lama.status.status !== "berhasil") {
          lama.pengendali?.abort(); lama.pengendali = undefined; lama.status = { status: "berhasil" }; berubah = true;
        }
      } else {
        lama?.pengendali?.abort();
        this.item.set(data.idLokal, { media: data, status: data.unggahan ? { status: "berhasil" } : { status: "menunggu" } });
        berubah = true;
      }
    }
    if (berubah) this.umumkan();
    this.jalankan();
  }

  aktifkan(online: boolean) { this.aktif = true; this.setOnline(online); }
  nonaktifkan() {
    this.aktif = false;
    this.jeda();
  }
  private jeda() {
    let berubah = false;
    for (const item of this.item.values()) if (item.pengendali || (item.jaringanGagal && item.status.status === "gagal")) {
      const pengendali = item.pengendali;
      item.pengendali = undefined; item.jaringanGagal = false; item.status = { status: "menunggu" }; pengendali?.abort(); berubah = true;
    }
    if (berubah) this.umumkan();
  }
  setOnline(online: boolean) {
    this.online = online;
    if (!online) this.jeda();
    else this.jalankan();
  }
  hapus(id: string) {
    const item = this.item.get(id);
    this.item.delete(id); item?.pengendali?.abort(); this.umumkan(); this.jalankan();
  }
  cobaLagi(id: string) {
    const item = this.item.get(id);
    if (item?.status.status !== "gagal" || !item.status.bisaUlang) return;
    item.status = { status: "menunggu" }; this.umumkan(); this.jalankan();
  }

  private jalankan() {
    if (!this.aktif || !this.online || [...this.item.values()].some((item) => item.pengendali)) return;
    const berikut = [...this.item].find(([, item]) => item.status.status === "menunggu");
    if (!berikut) return;
    const [id, item] = berikut;
    const pengendali = new AbortController();
    item.pengendali = pengendali; item.jaringanGagal = false; item.status = { status: "mengunggah", persen: null }; this.umumkan();
    const masihAktif = () => this.aktif && this.item.get(id) === item && item.pengendali === pengendali && !pengendali.signal.aborted;
    Promise.resolve().then(() => {
      if (!masihAktif()) throw new DOMException("Unggahan dibatalkan", "AbortError");
      return this.opsi.unggah(item.media.berkas, { signal: pengendali.signal, onUploadProgress: ({ loaded, total }) => {
        if (!masihAktif()) return;
        const persen = total !== null && total > 0 ? Math.min(100, Math.max(0, Math.round(loaded / total * 100))) : null;
        if (item.status.status !== "mengunggah" || item.status.persen === persen) return;
        item.status = { status: "mengunggah", persen }; this.umumkan();
      } });
    }).then((hasil) => {
      if (!masihAktif()) return;
      if (!hasilUnggahValid(hasil, item.media.berkas)) throw new ApiError("INTERNAL_ERROR", 200);
      item.pengendali = undefined; item.status = { status: "berhasil" };
      this.opsi.berhasil(id, hasil); this.umumkan(); this.jalankan();
    }).catch((error: unknown) => {
      if (!masihAktif()) return;
      item.pengendali = undefined;
      const permanen = error instanceof ApiError && error.status >= 400 && error.status < 500;
      item.jaringanGagal = error instanceof ApiError && error.code === "JARINGAN";
      item.status = { status: "gagal", pesan: pesanGagalMedia(error), bisaUlang: !permanen };
      this.opsi.gagal(`Gagal mengunggah ${item.media.berkas.name}: ${item.status.pesan}`);
      this.umumkan(); this.jalankan();
    });
  }
}

/**
 * Isi sementara untuk route yang sudah disiapkan FE-03 tetapi halamannya belum dikerjakan.
 * Ganti pemakaian komponen ini dengan halaman sebenarnya di tugas yang disebut `tugas`.
 */
type Props = {
  judul: string;
  /** ID tugas yang akan mengisi halaman ini, mis. "FE-08". */
  tugas: string;
  keterangan?: string;
  /** false untuk halaman Operator: layout Operator sudah memberi padding. */
  berpadding?: boolean;
};

export function HalamanSementara({ judul, tugas, keterangan, berpadding = true }: Props) {
  return (
    <main className={`flex flex-1 flex-col gap-2 ${berpadding ? "px-4 py-6 min-[400px]:px-8" : ""}`}>
      <h1 className="text-h2 text-dark-teal">{judul}</h1>
      <p className="text-body text-text-secondary">
        Halaman ini dikerjakan di {tugas}.{keterangan ? ` ${keterangan}` : ""}
      </p>
    </main>
  );
}

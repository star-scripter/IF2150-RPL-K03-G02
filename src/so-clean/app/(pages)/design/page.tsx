/**
 * Halaman contoh design tokens (FE-01) dan komponen UI dasar (FE-02), dipakai sebagai
 * referensi tim FE dan bukti verifikasi PR.
 */
import { ContohKomponen } from "./ContohKomponen";

const warna = [
  { nama: "dark-teal", nilai: "#094542", kelas: "bg-dark-teal", sumber: "Figma" },
  { nama: "emerald", nilai: "#05C274", kelas: "bg-emerald", sumber: "Figma" },
  { nama: "light-green", nilai: "#BCFB89", kelas: "bg-light-green", sumber: "Figma" },
  { nama: "sky-blue", nilai: "#85D5F6", kelas: "bg-sky-blue", sumber: "Figma" },
  { nama: "border", nilai: "#D5E0DC", kelas: "bg-border", sumber: "Figma" },
  { nama: "white", nilai: "#FFFFFF", kelas: "bg-white", sumber: "Figma" },
  { nama: "text-secondary", nilai: "#5B6B67", kelas: "bg-text-secondary", sumber: "Figma" },
  { nama: "yellow", nilai: "#F2A93B", kelas: "bg-yellow", sumber: "Figma" },
  { nama: "surface", nilai: "#F5FAF8", kelas: "bg-surface", sumber: "Figma (non-variabel)" },
  { nama: "warning-bg", nilai: "#FFF4DF", kelas: "bg-warning-bg", sumber: "Figma (non-variabel)" },
  { nama: "warning-text", nilai: "#82601F", kelas: "bg-warning-text", sumber: "Figma (non-variabel)" },
  { nama: "danger", nilai: "#D64545", kelas: "bg-danger", sumber: "Figma (non-variabel)" },
  { nama: "ink", nilai: "#000000", kelas: "bg-ink", sumber: "non-Figma" },
  { nama: "danger-text", nilai: "#B42318", kelas: "bg-danger-text", sumber: "non-Figma" },
  { nama: "danger-bg", nilai: "#FDECEA", kelas: "bg-danger-bg", sumber: "non-Figma" },
];

const tipografi = [
  { kelas: "text-h1", label: "Heading 1 · Plus Jakarta Sans Bold 32/40", Tag: "h1" },
  { kelas: "text-h2", label: "Heading 2 · Plus Jakarta Sans SemiBold 24/32", Tag: "h2" },
  { kelas: "text-h3", label: "Heading 3 · Plus Jakarta Sans SemiBold 20/28", Tag: "h3" },
  { kelas: "text-body", label: "Body · Inter Regular 16/24", Tag: "p" },
] as const;

export default function DesignPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-4 sm:p-8">
      <header>
        <h1 className="text-h1 text-dark-teal">Design tokens</h1>
        <p className="text-body">
          Diambil dari Figma UI-Prototype-CleanIt. Tulis token di <code>app/globals.css</code>.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-dark-teal">Warna</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {warna.map((w) => (
            <li key={w.nama} className="flex flex-col gap-2">
              <div className={`h-16 rounded-card border border-border ${w.kelas}`} />
              <div className="text-sm">
                <p className="font-semibold">{w.nama}</p>
                <p>
                  {w.nilai} · {w.sumber}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-dark-teal">Tipografi</h2>
        {tipografi.map(({ kelas, label, Tag }) => (
          <div key={kelas} className="flex flex-col gap-1 border-b border-border pb-3">
            <Tag className={kelas}>Laporkan sampah, kumpulkan poin</Tag>
            <span className="text-sm">
              <code>{kelas}</code> · {label}
            </span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-dark-teal">Radius</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex h-24 w-40 items-center justify-center rounded-card bg-dark-teal text-white">
            rounded-card · 12px
          </div>
          <div className="flex h-12 min-w-40 items-center justify-center rounded-button bg-emerald px-4">
            rounded-button · 12px
          </div>
          <div className="flex h-24 w-40 items-end justify-center rounded-t-sheet border border-border bg-white pb-3">
            rounded-t-sheet · 16px
          </div>
        </div>
      </section>

      <hr className="border-border" />

      <header>
        <h1 className="text-h1 text-dark-teal">Komponen UI dasar</h1>
        <p className="text-body">
          FE-02. Impor dari <code>@/components/ui</code>.
        </p>
      </header>

      <ContohKomponen />
    </main>
  );
}

/**
 * Halaman contoh design tokens (FE-01), dipakai sebagai referensi tim FE dan bukti verifikasi PR.
 * Contoh pemakaian komponen dasar (FE-02) dapat ditambahkan di halaman ini.
 */

const warna = [
  { nama: "dark-teal", nilai: "#094542", kelas: "bg-dark-teal", sumber: "Figma" },
  { nama: "emerald", nilai: "#05C274", kelas: "bg-emerald", sumber: "Figma" },
  { nama: "light-green", nilai: "#BCFB89", kelas: "bg-light-green", sumber: "Figma" },
  { nama: "sky-blue", nilai: "#85D5F6", kelas: "bg-sky-blue", sumber: "Figma" },
  { nama: "border", nilai: "#D5E0DC", kelas: "bg-border", sumber: "Figma" },
  { nama: "white", nilai: "#FFFFFF", kelas: "bg-white", sumber: "Figma" },
  { nama: "ink", nilai: "#000000", kelas: "bg-ink", sumber: "non-Figma" },
  { nama: "danger", nilai: "#D92D20", kelas: "bg-danger", sumber: "non-Figma" },
];

const tipografi = [
  { kelas: "text-h1", label: "Heading 1 · Plus Jakarta Sans Bold 32/40", Tag: "h1" },
  { kelas: "text-h2", label: "Heading 2 · Plus Jakarta Sans SemiBold 24/32", Tag: "h2" },
  { kelas: "text-h3", label: "Heading 3 · Plus Jakarta Sans SemiBold 20/28", Tag: "h3" },
  { kelas: "text-body", label: "Body · Inter Regular 16/24", Tag: "p" },
] as const;

export default function DesignTokensPage() {
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
            <Tag className={kelas}>Horas, DapinTampan</Tag>
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
            rounded-card · 8px
          </div>
          <div className="flex h-12 min-w-40 items-center px-4 justify-center rounded-button bg-emerald">
            rounded-button · 10px
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2 text-dark-teal">Contoh gabungan</h2>
        <div className="flex flex-col gap-4 rounded-card bg-dark-teal p-6 text-white">
          <h3 className="text-h3">Poin Anda</h3>
          <p className="font-heading text-h1 text-light-green">67</p>
          <span className="rounded-button bg-emerald py-3 text-center text-body text-ink">
            Tukar Hadiah
          </span>
        </div>
        <p className="text-body text-danger">Contoh pesan error: email atau password salah.</p>
      </section>
    </main>
  );
}

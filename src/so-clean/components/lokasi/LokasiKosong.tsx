import Link from "next/link";
import { kelasButton } from "@/components/ui";
import { ROUTE } from "@/lib/nav";

/** I-10 / FE-15. Dipasang di slot sukses-kosong FE-14; tidak mengambil data sendiri. */
export function LokasiKosong() {
  return (
    <section aria-labelledby="judul-lokasi-kosong" className="flex flex-col items-center gap-5 py-6 text-center min-[400px]:gap-6 min-[400px]:py-12">
      <div aria-hidden className="flex size-24 shrink-0 items-center justify-center rounded-full bg-emerald/10 min-[400px]:size-30">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false" className="size-12 text-dark-teal min-[400px]:size-14">
          <path d="M39 19c0 11-15 25-15 25S9 30 9 19a15 15 0 1 1 30 0Z" />
          <path d="m18 20 4 4 8-8" />
        </svg>
      </div>
      <div role="status" className="space-y-2">
        <h2 id="judul-lokasi-kosong" className="font-heading text-xl leading-7 font-semibold text-dark-teal">Belum terdapat lokasi pencemaran</h2>
        <p className="text-body text-text-secondary">Belum ada lokasi tercemar terverifikasi yang tersedia untuk dibersihkan. Nemu sampah di perairan? Laporkan lewat ReportIt.</p>
      </div>
      <Link href={ROUTE.reportit} prefetch={false} className={kelasButton({
        lebarPenuh: true,
        className: "min-h-14! bg-sky-blue! px-3! text-sm! text-dark-teal! min-[400px]:text-body!",
      })}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false" className="size-5 shrink-0">
          <path d="M9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3M9 11h6M9 15h6" />
          <rect x="9" y="2" width="6" height="5" rx="1" />
        </svg>
        Buat Laporan ReportIt
      </Link>
    </section>
  );
}

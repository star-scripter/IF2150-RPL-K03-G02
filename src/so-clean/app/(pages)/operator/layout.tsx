/**
 * Layout semua halaman Operator (FE-03): header Operator selebar layar dan konten selebar
 * desktop (maks. 1080px, sesuai Figma Validator laporan), dengan latar `surface`.
 *
 * Belum ada cek role; halaman ini masih bisa dibuka siapa saja sampai FE-05/BE-06.
 * Elemen `<main>` dibuat oleh tiap halaman, bukan layout.
 */
import { Suspense, type ReactNode } from "react";
import { HeaderOperator } from "@/components/HeaderOperator";
import { HeaderOperatorAktif } from "@/components/HeaderOperatorAktif";

export default function LayoutOperator({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      {/* usePathname di header butuh Suspense (cacheComponents); fallback tanpa nav aktif. */}
      <Suspense fallback={<HeaderOperator pathname={null} />}>
        <HeaderOperatorAktif />
      </Suspense>
      <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </div>
    </div>
  );
}

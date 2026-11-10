import type { ReactNode } from "react";
import { HeaderMasyarakat } from "@/components/HeaderMasyarakat";

/**
 * Layout FE-09: header selebar layar dan kontainer desktop seperti halaman Operator.
 * Route group ini memisahkan form dari batas 440px layout Masyarakat bersama.
 */
export default function LayoutLaporan({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      <HeaderMasyarakat />
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col md:max-w-[1080px] md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}

/**
 * Layout halaman publik Login dan Register (FE-06, FE-07): header SoClean dan kolom selebar HP
 * (440px) di tengah layar, sesuai frame Figma "Login Page" (12:19) dan "Register Page" (24:106).
 *
 * Logo tidak ditautkan ke Beranda karena pengguna belum login. Elemen `<main>` dibuat oleh tiap
 * halaman, bukan layout.
 */
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-surface">
      <div className="flex w-full max-w-[440px] flex-col">
        <header className="bg-dark-teal px-4 py-3.5 min-[400px]:px-8">
          <div className="flex h-[68px] items-center">
            <Logo />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

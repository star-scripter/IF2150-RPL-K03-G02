/**
 * Route /register (I-02). Halaman publik; nama route sama dengan proxy BE-06.
 * Header dan kolom halaman dari `(auth)/layout.tsx`.
 */
import type { Metadata } from "next";
import { FormRegister } from "@/components/FormRegister";

export const metadata: Metadata = {
  title: "Daftar · SoClean",
};

export default function Page() {
  return (
    <main className="flex flex-col gap-7 px-[35px] pt-8 pb-10">
      <h1 className="text-h2 text-dark-teal">Daftar Akun</h1>
      <FormRegister />
    </main>
  );
}

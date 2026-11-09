/**
 * Route /register (I-02). Halaman publik; nama route sama dengan proxy BE-06.
 */
import type { Metadata } from "next";
import { FormRegister } from "@/components/FormRegister";

export const metadata: Metadata = {
  title: "Daftar · SoClean",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      {/* TODO(FE-03): header hijau dengan <Logo /> sesuai frame "Register Page" (Header 24:108). */}
      <main className="mx-auto flex w-full max-w-[440px] flex-col gap-7 px-[35px] pt-8 pb-10">
        <h1 className="text-h2 text-dark-teal">Daftar Akun</h1>
        <FormRegister />
      </main>
    </div>
  );
}

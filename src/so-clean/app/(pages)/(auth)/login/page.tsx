/**
 * Route /login (I-01). Halaman publik; nama route sama dengan proxy BE-06.
 * Header dan kolom halaman dari `(auth)/layout.tsx`.
 */
import type { Metadata } from "next";
import { FormLogin } from "@/components/FormLogin";

export const metadata: Metadata = {
  title: "Masuk · SoClean",
};

export default function Page() {
  return (
    <main className="flex flex-col gap-7 px-[35px] pt-8 pb-10">
      <h1 className="text-h2 text-dark-teal">Masuk Akun</h1>
      <FormLogin />
    </main>
  );
}

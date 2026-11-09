import Link from "next/link";

// Halaman sementara. Pengarahan `/` sesuai peran (I-03 / I-07) dibuat di FE-05.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-h1 text-dark-teal">SoClean</h1>
      <p className="text-body">Aplikasi sedang dibangun.</p>
      <Link href="/design" className="text-body text-dark-teal underline">
        Lihat design tokens
      </Link>
    </main>
  );
}

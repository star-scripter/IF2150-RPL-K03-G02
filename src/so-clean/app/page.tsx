import Link from "next/link";
import { ROUTE } from "@/lib/nav";

// Halaman sementara. Pengarahan `/` sesuai peran (I-03 / I-07) dibuat di FE-05.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-h1 text-dark-teal">SoClean</h1>
      <p className="text-body">Aplikasi sedang dibangun.</p>
      <ul className="flex flex-col gap-2 text-body text-dark-teal underline">
        <li>
          <Link href={ROUTE.beranda}>Halaman Masyarakat</Link>
        </li>
        <li>
          <Link href={ROUTE.operatorLaporan}>Halaman Operator</Link>
        </li>
        <li>
          <Link href="/design">Design tokens dan komponen</Link>
        </li>
      </ul>
    </main>
  );
}

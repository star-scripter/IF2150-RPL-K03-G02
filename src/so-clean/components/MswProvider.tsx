/**
 * Menyalakan mock API (MSW) di browser saat development (FE-04).
 *
 * Aktif hanya jika `NEXT_PUBLIC_API_MOCKING=enabled` (mis. di `so-clean/.env.local`) dan
 * bukan build production. Saat tidak aktif, request diteruskan ke BE sungguhan.
 *
 * Worker dinyalakan saat modul ini dimuat di browser, sebelum komponen halaman berjalan.
 * Halaman tetap dirender seperti biasa (termasuk di server); yang ditahan hanya request lewat
 * `lib/api`, sampai worker siap.
 */
"use client";

import type { ReactNode } from "react";
import { tahanRequestSampai } from "@/lib/api/client";
// Di browser di-alias ke `mocks/browser.ts` (lihat next.config.ts); di server bernilai null.
import { worker } from "@/mocks/worker";

const MOCK_AKTIF =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled" && process.env.NODE_ENV !== "production";

const penanda = globalThis as typeof globalThis & { __soCleanMswDimulai?: boolean };

// Start sekali saja, walaupun modul dimuat ulang oleh HMR.
if (MOCK_AKTIF && typeof window !== "undefined" && worker && !penanda.__soCleanMswDimulai) {
  penanda.__soCleanMswDimulai = true;
  tahanRequestSampai(
    worker
      // Request selain handler mock (halaman, aset Next.js, font) diteruskan tanpa peringatan.
      .start({ onUnhandledFrame: "bypass" })
      .catch((error: unknown) => console.error("[msw] gagal menyalakan mock API:", error)),
  );
}

export function MswProvider({ children }: { children: ReactNode }) {
  return children;
}

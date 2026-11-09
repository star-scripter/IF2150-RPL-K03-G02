/**
 * Semua handler mock MSW (FE-04): 18 endpoint di "Daftar endpoint" kontrak.
 * Dipakai bersama oleh browser (`mocks/browser.ts`) dan test Vitest (`mocks/node.ts`).
 */
import { authHandlers } from "./auth";
import { laporanHandlers } from "./laporan";
import { lokasiHandlers } from "./lokasi";
import { mediaHandlers } from "./media";
import { notifikasiHandlers } from "./notifikasi";
import { penukaranHandlers } from "./penukaran";

export const handlers = [
  ...authHandlers,
  ...mediaHandlers,
  ...laporanHandlers,
  ...lokasiHandlers,
  ...penukaranHandlers,
  ...notifikasiHandlers,
];

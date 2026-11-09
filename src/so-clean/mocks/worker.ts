/**
 * Stub worker MSW untuk server (FE-04).
 *
 * `msw/browser` hanya tersedia di browser. `next.config.ts` (turbopack.resolveAlias) mengarahkan
 * import `@/mocks/worker` ke `mocks/browser.ts` saat bundle browser; di server, file inilah
 * yang dipakai sehingga tidak ada yang dijalankan.
 */
import type { SetupWorker } from "msw/browser";

export const worker: SetupWorker | null = null;

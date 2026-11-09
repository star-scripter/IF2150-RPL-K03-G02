import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Emit a self-contained server in .next/standalone for the production Docker image
  output: "standalone",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    resolveAlias: {
      // Mock API (FE-04): `msw/browser` tidak tersedia di server. Di browser, `@/mocks/worker`
      // diarahkan ke worker MSW asli; di server tetap ke stub kosong `mocks/worker.ts`.
      "@/mocks/worker": { browser: "./mocks/browser.ts" },
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

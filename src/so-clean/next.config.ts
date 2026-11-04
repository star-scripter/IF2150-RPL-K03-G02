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
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

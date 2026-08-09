import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads (10 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Next.js 16 uses Turbopack by default — provide empty config to silence the warning.
  // puppeteer/chromium are server-only and excluded from bundling via serverExternalPackages.
  turbopack: {},

  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium-min"],
};

export default nextConfig;


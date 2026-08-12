/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The BullMQ/Playwright worker lives outside the Next build. These packages are
  // only imported from files under src/worker and src/server/data-provider/scraper-provider,
  // never from the app/route tree, so they never end up in a serverless bundle.
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "ioredis", "bullmq", "playwright"],
  },
};

export default nextConfig;

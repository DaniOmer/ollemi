import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // domains: ["picsum.photos"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "knbrbqjkgxwvopnqvonn.supabase.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  eslint: {
    // Disable ESLint during build to avoid the ESLint configuration issues
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);

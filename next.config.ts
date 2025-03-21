import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["picsum.photos"],
  },
};

export default withNextIntl(nextConfig);

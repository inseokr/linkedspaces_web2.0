import type { NextConfig } from "next";

const BLOG_ORIGIN = process.env.BLOG_ORIGIN;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BLOG_ORIGIN) {
      return [];
    }

    return [
      {
        source: "/trip/:path*",
        destination: `${BLOG_ORIGIN}/trip/:path*`,
      },
    ];
  },
};

export default nextConfig;

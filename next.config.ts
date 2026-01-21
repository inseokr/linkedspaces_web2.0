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
  images: {
    // 프로필 사진이 오는 외부 도메인 허용
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-us-west-1.amazonaws.com",
        pathname: "/linkedspaces.fs/**",
      },
    ],
  },
};

export default nextConfig;

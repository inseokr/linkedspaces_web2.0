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
        hostname: "pocketverse.herokuapp.com",
        pathname: "/public/user_resources/pictures/profile_pictures/**",
      },
    ],
  },
};

export default nextConfig;

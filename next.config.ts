import type { NextConfig } from "next";

const BLOG_ORIGIN = process.env.BLOG_ORIGIN;

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default in dev. Since we also provide a custom
  // webpack config (used for `next build` and `next dev --webpack`), add an
  // explicit Turbopack config to avoid the "webpack config with no turbopack
  // config" error message.
  turbopack: {},
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
      {
        protocol: "https",
        hostname: "pocketverse.herokuapp.com",
        pathname: "/user_resources/**",
      },
      {
        protocol: "https",
        hostname: "pocketverse.herokuapp.com",
        pathname: "/public/user_resources/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Reduce baseline dev-server memory by ignoring very large / legacy folders
    // that don't need HMR.
    if (dev) {
      const extraIgnored = ["**/src/legacy-blog/**", "**/public/videos/**"];
      const existingIgnored = (config.watchOptions?.ignored ?? []) as any;
      const normalized = Array.isArray(existingIgnored)
        ? existingIgnored
        : existingIgnored
          ? [existingIgnored]
          : [];
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: [...normalized, ...extraIgnored],
      };
    }
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "edspickle.shop" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;

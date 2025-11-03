import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "controles.internit.com.br",
      },
    ],
  },
};

export default nextConfig;

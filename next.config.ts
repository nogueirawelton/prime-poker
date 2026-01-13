import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "controles.internit.com.br",
      },
      {
        hostname: "admin.primepokerteam.com.br",
      },
    ],
  },
};

export default nextConfig;

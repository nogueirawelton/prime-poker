import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  trailingSlash: true,
  poweredByHeader: false,

  images: {
    deviceSizes: [640, 768, 1080, 1280, 1920],
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "controles.internit.com.br",
      },
      {
        protocol: "https",
        hostname: "admin.primepokerteam.com.br",
      },
    ],
  },

  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "radix-ui",
      "react-toastify",
    ],
    inlineCss: true,
    webVitalsAttribution: ["CLS", "LCP", "FCP", "INP", "TTFB"],
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;

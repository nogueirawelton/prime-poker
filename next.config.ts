import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  trailingSlash: true,
  poweredByHeader: false,

  // Headers de segurança em todas as respostas. A CSP completa (scripts,
  // estilos, mídias) ficou de fora: GTM, YouTube e o WordPress exigiriam uma
  // lista extensa de origens, e qualquer esquecimento quebra o site em
  // produção. `frame-ancestors` cobre o clickjacking sem esse risco.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

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

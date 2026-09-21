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
    // AVIF ficou de fora de propósito. Medido nesta imagem de banner
    // (1080x1920), com o cache do otimizador vazio: AVIF leva ~800ms para
    // transcodificar e entrega 22 KB; WebP leva ~230ms e entrega 29 KB.
    // Os 7 KB que o AVIF economiza valem ~35ms no 4G lento do PageSpeed e
    // custam ~570ms de servidor — e essa conta cai inteira em cima do LCP,
    // porque a imagem do banner é o maior elemento da tela. O cache do
    // otimizador é apagado a cada deploy, então o custo frio é a regra na
    // primeira visita, não a exceção.
    formats: ["image/webp"],
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
    // O padrão do Next são 1 MB, contando o corpo INTEIRO da Server Action —
    // e um arquivo atravessa essa fronteira codificado, ocupando mais do que
    // o tamanho em disco. A foto de perfil estourava o limite. 20 MB deixa
    // folga; quem confere o tamanho de verdade é o plugin, que vê o arquivo.
    serverActions: { bodySizeLimit: "20mb" },

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

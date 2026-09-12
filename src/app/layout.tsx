import { GoogleTagManager } from "@next/third-parties/google";
import { Montserrat } from "next/font/google";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { ConsentProvider, CookieConsent } from "@/components/shared/consent";
import { ConsentInit } from "@/components/shared/consent/consent-init";
import { UtmCapture } from "@/components/shared/utm-capture";
import { WebVitals } from "@/components/shared/web-vitals";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

/**
 * Layout raiz: só o que é genuinamente global (fonte, consentimento, GTM,
 * toasts). O scroll suave do Lenis e o Header/Footer vivem no
 * `(institucional)` — a área do player não deve herdar nenhum dos dois.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `scroll-smooth` foi removido de propósito: o smooth scroll do CSS briga
    // com o do Lenis. O `scroll-pt-*` compensa o header fixo (h-24 / lg:h-28) e
    // é respeitado tanto pelo Lenis quanto pelo scroll nativo.
    <html
      lang="pt-BR"
      className={`${montserrat.variable} scroll-pt-24 lg:scroll-pt-28`}
    >
      <body className="bg-prime-dark antialiased">
        <ConsentInit />

        <ConsentProvider>
          <WebVitals />

          {/* `usePathname` só tem valor em tempo de requisição: fora de um
              boundary, ele bloquearia o prerender do shell de qualquer rota
              com parâmetro desconhecido (ex.: /player/aulas/[slug]). Como o
              componente não renderiza nada, o fallback é `null`. */}
          <Suspense fallback={null}>
            <UtmCapture />
          </Suspense>

          {children}

          <ToastContainer />
          <CookieConsent />
        </ConsentProvider>

        <GoogleTagManager gtmId="GTM-PZQP6GVH" />
      </body>
    </html>
  );
}

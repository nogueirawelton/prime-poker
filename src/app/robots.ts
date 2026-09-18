import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Fora de produção (staging e previews da Vercel), nada é indexável: um
 * deploy de teste no Google concorre com o site oficial e expõe o que ainda
 * não foi lançado. `VERCEL_ENV` só vale `production` no deploy da master.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Área logada, autenticação e endpoints não têm o que indexar.
      disallow: [
        "/player/",
        "/login/",
        "/cadastro/",
        "/redefinir-senha/",
        "/api/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}

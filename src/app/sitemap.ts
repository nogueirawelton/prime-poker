import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Só páginas públicas e indexáveis. A área do jogador e as telas de
 * autenticação ficam de fora — e bloqueadas no `robots.ts`.
 *
 * As URLs terminam em `/` porque o projeto usa `trailingSlash: true`: sem a
 * barra, cada entrada apontaria para um redirect.
 *
 * Blog oculto na master — reativar quando for ao ar (a versão com posts e
 * categorias está na staging).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE}/politica-de-privacidade/`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}

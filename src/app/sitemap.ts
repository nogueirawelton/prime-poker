import type { MetadataRoute } from "next";
import { getCategories, getPostIndex } from "@/services/blog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Só páginas públicas e indexáveis. A área do jogador e as telas de
 * autenticação ficam de fora — e bloqueadas no `robots.ts`.
 *
 * As URLs terminam em `/` porque o projeto usa `trailingSlash: true`: sem a
 * barra, cada entrada apontaria para um redirect.
 *
 * A paginação do blog (`/blog/pagina/N`) não entra: são listagens que mudam a
 * cada post novo, e os posts já chegam ao buscador pelas próprias URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    getPostIndex(),
    getCategories(),
  ]);

  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/blog/`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${SITE}/politica-de-privacidade/`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...categories.map((category) => ({
      url: `${SITE}/blog/categoria/${category.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: `${SITE}/blog/${post.slug}/`,
      lastModified: post.modified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

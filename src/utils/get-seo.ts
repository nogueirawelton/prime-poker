import type { Metadata } from "next";
import { query } from "@/graphql/client";
import { SEO } from "@/graphql/queries/SEO";

type Params = {
  params: Promise<Record<string, string>>;
};

function formatSEO(seo: any): Metadata | null {
  if (!seo) {
    return null;
  }

  return {
    title: seo.title,
    description: seo.metaDesc,
    // `focuskw` costuma vir vazio/nulo do Yoast em posts sem palavra-chave.
    keywords: seo.focuskw ? seo.focuskw.replaceAll(";", ", ") : undefined,
    authors: [
      {
        name: "Welton Nogueira",
        url: "https://nogueirawelton.com.br",
      },
    ],
    alternates: {
      canonical: seo.canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      title: seo.title,
      description: seo.metaDesc,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: seo.opengraphImage?.mediaItemUrl
        ? [{ url: seo.opengraphImage.mediaItemUrl }]
        : undefined,
    },
  };
}

/**
 * Fábrica de `generateMetadata`.
 *
 * - `getSEO("page", "home")` → página fixa, resolvida pela URI.
 * - `getSEO("post")`         → post type dinâmico, slug vindo de `params.post`.
 */
export function getSEO(postType: string, uri?: string) {
  return async ({ params }: Params): Promise<Metadata | null> => {
    if (uri) {
      const data: any = await query(SEO(postType, "URI", uri));

      // Um nó ausente no WP não pode derrubar o build.
      if (!data?.[postType]) {
        console.warn(`SEO: "${uri}" (${postType}) não encontrado no WordPress`);
        return null;
      }

      return formatSEO(data[postType].seo);
    }

    const slug = (await params)[postType];

    if (!slug) {
      console.warn(`SEO: slug ausente para o post type "${postType}"`);
      return null;
    }

    const data: any = await query(SEO(postType, "SLUG", slug));

    return formatSEO(data?.[postType]?.seo);
  };
}

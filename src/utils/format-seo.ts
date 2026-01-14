import { Metadata } from "next";

export function formatSEO(SEO: any): Metadata | null {
  if (!SEO) {
    return null;
  }

  return {
    title: SEO.title,
    description: SEO.metaDesc,
    keywords: SEO.focuskw.replaceAll(";", ", "),
    authors: [
      {
        name: "Internit",
        url: "https://internit.com.br",
      },
    ],
    alternates: {
      canonical: SEO.canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      title: SEO.title,
      description: SEO.metaDesc,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [
        {
          url: SEO.opengraphImage?.mediaItemUrl,
        },
      ],
    },
  };
}

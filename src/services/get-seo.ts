import { client } from "@/graphql/client";
import { SEO } from "@/graphql/queries/SEO";
import { formatSEO } from "@/utils/format-seo";
import { Metadata } from "next";

interface Params {
  params: Promise<Record<string, string>>;
}

const singleToMany = {
  page: {
    type: "pages",
    param: "name",
  },
  category: {
    type: "productCategories",
    param: "slug",
  },
  product: {
    type: "products",
    param: "slugIn",
  },
};

export function getSEO({ postType, uri }: { postType: string; uri?: string }) {
  return async ({ params }: Params): Promise<Metadata | null> => {
    // Pages

    const page = singleToMany[postType as keyof typeof singleToMany];

    if (uri) {
      const pageResponse = await client.request(
        SEO(page.type, page.param, uri),
      );

      const pageSEO = pageResponse[page.type]?.nodes[0]?.seo;

      console.log(pageResponse);

      return formatSEO(pageSEO);
    }

    // PostTypes
    const slug = (await params)[`${postType}ID`];

    if (!slug) {
      console.log("WARNING: Page or PostType ID is NULL");
      return null;
    }

    const postResponse = await client.request(SEO(page.type, page.param, slug));

    const postSEO = postResponse[page.type]?.nodes[0]?.seo;

    return formatSEO(postSEO);
  };
}

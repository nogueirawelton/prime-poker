import { revalidateTag } from "next/cache";
import { INSTAGRAM_CACHE_TAG } from "@/components/pages/home/instagram/list";
import { CMS_CACHE_TAG } from "@/graphql/client";

export async function GET() {
  try {
    revalidateTag(CMS_CACHE_TAG, "max");
    revalidateTag(INSTAGRAM_CACHE_TAG, "max");

    return Response.json({
      message: "Cache limpo com sucesso!",
      tags: [CMS_CACHE_TAG, INSTAGRAM_CACHE_TAG],
    });
  } catch (err) {
    return Response.json(err, {
      status: 500,
    });
  }
}

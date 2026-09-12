import { cacheLife, cacheTag } from "next/cache";
import { INSTAGRAM_CACHE_TAG } from "@/lib/cache-tags";
import { InstagramCarousel } from "./carousel";

type InstagramPost = Record<string, any>;

async function getPosts(): Promise<Array<InstagramPost>> {
  "use cache";
  cacheLife("days");
  cacheTag(INSTAGRAM_CACHE_TAG);

  const baseUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const profile = process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE;

  if (!baseUrl || !profile) return [];

  try {
    const response = await fetch(`${baseUrl}/api/profiles/${profile}`);

    if (!response.ok) return [];

    const { posts } = await response.json();

    return Array.isArray(posts) ? posts : [];
  } catch {
    // Uma indisponibilidade do provedor do Instagram não deve derrubar a home.
    return [];
  }
}

export async function List() {
  const posts = await getPosts();

  if (!posts.length) return null;

  return <InstagramCarousel posts={posts.slice(0, 6)} />;
}

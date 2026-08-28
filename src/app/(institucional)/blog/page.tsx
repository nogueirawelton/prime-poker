import type { Metadata } from "next";
import { BlogBrowser } from "@/components/pages/blog/blog-browser";
import { FeaturedCarousel } from "@/components/pages/blog/featured-carousel";
import {
  ALL_POSTS,
  CATEGORIES,
  getPage,
  STICKY_POSTS,
  TOTAL_PAGES,
} from "@/components/pages/blog/mock";
import { Pagination } from "@/components/pages/blog/pagination";
import { Cards } from "@/icons/cards";

export const metadata: Metadata = {
  title: "Blog | Prime Poker Team",
  description:
    "Estratégia, mindset e bastidores do Prime Poker Team. Conteúdo para quem leva o pôquer a sério.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <main>
      <header className="flex flex-col">
        <strong className="flex items-center gap-2 font-normal text-prime-red uppercase">
          <Cards className="size-6 stroke-prime-red" />
          Blog
        </strong>

        <h1 className="mt-2 font-black text-3xl text-prime-light uppercase lg:text-5xl">
          Conteúdo que <span className="text-prime-red">vira resultado</span>
        </h1>

        <p className="mt-4 max-w-2xl text-prime-light/70 text-sm lg:text-base">
          Estratégia, mindset e bastidores por quem vive o jogo todos os dias.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-bold text-prime-light text-xl uppercase">
          Em destaque
        </h2>
        <FeaturedCarousel posts={STICKY_POSTS} />
      </section>

      <BlogBrowser
        allPosts={ALL_POSTS}
        pagePosts={getPage(1)}
        categories={CATEGORIES}
        pagination={<Pagination current={1} total={TOTAL_PAGES} />}
      />
    </main>
  );
}

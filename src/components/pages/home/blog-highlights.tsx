import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ALL_POSTS } from "@/components/pages/blog/mock";
import { PostCard } from "@/components/pages/blog/post-card";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";

/**
 * Vitrine do blog na home.
 *
 * Hoje lê o mock; quando o CMS entrar, só a origem dos posts muda — o card e
 * o layout são os mesmos do blog.
 */
export function BlogHighlights() {
  const posts = ALL_POSTS.slice(0, 3);

  if (!posts.length) return null;

  return (
    <section id="blog" className="bg-prime-dark">
      <AnimationContainer
        animation="home/instagram"
        className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24"
      >
        <div
          data-el="data"
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex flex-col">
            <strong
              data-el="strong"
              className="flex items-center gap-2 font-normal text-prime-red uppercase"
            >
              <Cards className="size-6 stroke-prime-red" />
              Blog
            </strong>

            <h2 className="mt-2 font-bold text-3xl text-prime-light uppercase lg:text-4xl">
              Últimas do blog
            </h2>

            <p className="mt-3 max-w-xl text-prime-light/70 text-sm lg:text-base">
              Estratégia, mindset e bastidores por quem vive o jogo todos os
              dias.
            </p>
          </div>

          <Link
            href="/blog"
            className="flex h-12 w-fit shrink-0 items-center gap-2 rounded-md border border-white/20 px-5 font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
          >
            Ver todos
            <ArrowRightIcon className="size-5" weight="bold" />
          </Link>
        </div>

        <div data-el="posts" className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </AnimationContainer>
    </section>
  );
}

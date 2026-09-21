import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Post } from "@/services/blog";
import { PostCover } from "./post-cover";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * O nível do título muda com o contexto.
 *
 * Nas listagens (`/blog`, `/blog/pagina/N`, `/blog/categoria/N`) os cards são
 * a primeira subdivisão depois do `h1`, então precisam ser `h2` — usar `h3`
 * ali pulava um nível e quebrava a navegação por cabeçalhos de leitores de
 * tela. Já nos relacionados do fim de um artigo eles vivem sob o
 * `h2` "Leia também", e aí `h3` é o certo — por isso é o padrão.
 */
export function PostCard({
  post,
  headingLevel = 3,
}: {
  post: Post;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3 transition-all duration-500 hover:border-prime-red/50"
      >
        <PostCover post={post} className="aspect-16/9 w-full" />

        <div className="flex flex-1 flex-col gap-3 p-5">
          {post.category && (
            <span className="w-fit rounded-full bg-prime-red/15 px-3 py-1 font-semibold text-prime-red text-xs uppercase">
              {post.category.name}
            </span>
          )}

          <Heading className="font-bold text-lg text-prime-light leading-snug transition-colors duration-500 group-hover:text-prime-red">
            {post.title}
          </Heading>

          <p className="line-clamp-3 flex-1 text-prime-light/70 text-sm leading-relaxed">
            {post.excerpt}
          </p>

          <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-white/10 border-t pt-3 text-prime-light/50 text-xs">
            <span className="font-medium text-prime-light/70">
              {post.author}
            </span>
            <time dateTime={post.date}>
              {dateFormatter.format(new Date(post.date))}
            </time>
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {post.readingTime} min
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}

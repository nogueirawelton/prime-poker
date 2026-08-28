import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { ALL_POSTS, getPost, getRelated } from "@/components/pages/blog/mock";
import { PostCard } from "@/components/pages/blog/post-card";
import { PostCover } from "@/components/pages/blog/post-cover";
import { ReadingProgress } from "@/components/pages/blog/reading-progress";
import { ShareButtons } from "@/components/pages/blog/share-buttons";

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function generateStaticParams() {
  return ALL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return {};

  return {
    title: `${post.title} | Prime Poker Team`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const related = getRelated(post);
  const published = dateFormatter.format(new Date(`${post.date}T12:00:00`));

  return (
    <>
      <ReadingProgress />

      <article>
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            {
              label: post.category.name,
              href: `/blog/categoria/${post.category.slug}`,
            },
            { label: post.title },
          ]}
        />

        <header className="mt-4 flex flex-col gap-4">
          <Link
            href={`/blog/categoria/${post.category.slug}`}
            className="w-fit rounded-full bg-prime-red px-3 py-1 font-semibold text-prime-light text-xs uppercase transition-opacity duration-500 hover:opacity-85"
          >
            {post.category.name}
          </Link>

          <h1 className="max-w-4xl font-black text-3xl text-prime-light uppercase leading-tight lg:text-5xl">
            {post.title}
          </h1>

          <p className="max-w-3xl text-base text-prime-light/70 lg:text-lg">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-prime-light/60 text-sm">
            <span className="font-semibold text-prime-light">
              {post.author}
            </span>
            <time dateTime={post.date}>{published}</time>
            <span className="flex items-center gap-1">
              <ClockIcon className="size-4" />
              {post.readingTime} min de leitura
            </span>
          </div>
        </header>

        <PostCover
          post={post}
          variant="hero"
          className="mt-10 aspect-21/9 w-full rounded-xl"
        />

        {/* `max-w-3xl` mantém a linha em ~75 caracteres: medida de leitura. */}
        <div className="mt-12 flex max-w-3xl flex-col gap-8">
          {post.content.map((block) => (
            <section
              key={block.heading ?? block.paragraphs[0].slice(0, 24)}
              className="flex flex-col gap-4"
            >
              {block.heading && (
                <h2 className="font-bold text-2xl text-prime-light">
                  {block.heading}
                </h2>
              )}

              {block.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-base text-prime-light/80 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer className="mt-12 max-w-3xl border-white/10 border-t pt-8">
          <ShareButtons title={post.title} />
        </footer>
      </article>

      {related.length > 0 && (
        <aside className="mt-20">
          <h2 className="font-bold text-prime-light text-xl uppercase">
            Continue lendo
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

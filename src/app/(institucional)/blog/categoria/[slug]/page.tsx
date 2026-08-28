import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { CATEGORIES, getByCategory } from "@/components/pages/blog/mock";
import { PostCard } from "@/components/pages/blog/post-card";
import { Cards } from "@/icons/cards";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((item) => item.slug === slug);

  if (!category) return {};

  return {
    title: `${category.name} | Blog Prime Poker Team`,
    description: `Artigos sobre ${category.name.toLowerCase()} no blog do Prime Poker Team.`,
    alternates: { canonical: `/blog/categoria/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES.find((item) => item.slug === slug);

  if (!category) notFound();

  const posts = getByCategory(slug);

  return (
    <main>
      <Breadcrumbs
        items={[{ label: "Blog", href: "/blog" }, { label: category.name }]}
      />

      <header className="mt-4 flex flex-col">
        <strong className="flex items-center gap-2 font-normal text-prime-red uppercase">
          <Cards className="size-6 stroke-prime-red" />
          Categoria
        </strong>

        <h1 className="mt-2 font-black text-3xl text-prime-light uppercase lg:text-5xl">
          {category.name}
        </h1>

        <p className="mt-3 text-prime-light/70 text-sm">
          {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
        </p>
      </header>

      <nav aria-label="Outras categorias" className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <a
            key={item.slug}
            href={`/blog/categoria/${item.slug}`}
            aria-current={item.slug === slug ? "page" : undefined}
            className={
              item.slug === slug
                ? "rounded-full border border-prime-red bg-prime-red px-4 py-2 font-semibold text-prime-light text-xs uppercase"
                : "rounded-full border border-white/15 px-4 py-2 font-semibold text-prime-light/70 text-xs uppercase transition-all duration-500 hover:border-white/40 hover:text-prime-light"
            }
          >
            {item.name}
          </a>
        ))}
      </nav>

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-white/10 border-dashed p-16 text-center text-prime-light/60">
          Ainda não há artigos nesta categoria.
        </p>
      )}
    </main>
  );
}

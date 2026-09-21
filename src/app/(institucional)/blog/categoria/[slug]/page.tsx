import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { Pagination } from "@/components/pages/blog/pagination";
import { PostCard } from "@/components/pages/blog/post-card";
import { Cards } from "@/icons/cards";
import {
  getCategories,
  getCategory,
  getPage,
  getTotal,
  getTotalPages,
} from "@/services/blog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return {};

  return {
    title: `${category.name} | Blog Prime Poker Team`,
    description: `Artigos sobre ${category.name.toLowerCase()} no blog do Prime Poker Team.`,
    alternates: { canonical: `/blog/categoria/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const [category, categories, total] = await Promise.all([
    getCategory(slug),
    getCategories(),
    getTotal({ category: slug }),
  ]);

  if (!category) notFound();

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
          {/* Total da categoria, não o tamanho da página: com paginação as
              duas coisas deixam de coincidir. */}
          {total} {total === 1 ? "artigo" : "artigos"}
        </p>
      </header>

      <nav aria-label="Outras categorias" className="mt-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <Link
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
          </Link>
        ))}
      </nav>

      {/* A página pedida vem da URL, que só existe em tempo de requisição:
          atrás do boundary, o cabeçalho e a navegação seguem no shell. */}
      <Suspense fallback={<Skeleton />}>
        <PostList slug={slug} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const GRID = "mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3";

async function PostList({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Props["searchParams"];
}) {
  const { p } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const filter = { category: slug };

  const [posts, totalPages] = await Promise.all([
    getPage(page, filter),
    getTotalPages(filter),
  ]);

  if (posts.length === 0) {
    return (
      <p className="mt-10 rounded-xl border border-white/10 border-dashed p-16 text-center text-prime-light/60">
        Ainda não há artigos nesta categoria.
      </p>
    );
  }

  return (
    <>
      <div className={GRID}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} headingLevel={2} />
        ))}
      </div>

      <Pagination
        current={page}
        total={totalPages}
        hrefFor={(page) =>
          page <= 1
            ? `/blog/categoria/${slug}`
            : `/blog/categoria/${slug}?p=${page}`
        }
      />
    </>
  );
}

function Skeleton() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => index).map((index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-xl border border-white/10 bg-white/3"
        />
      ))}
    </div>
  );
}

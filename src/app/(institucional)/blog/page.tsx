import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogSearch } from "@/components/pages/blog/blog-search";
import { CategoryNav } from "@/components/pages/blog/category-nav";
import { FeaturedCarousel } from "@/components/pages/blog/featured-carousel";
import { Pagination } from "@/components/pages/blog/pagination";
import { PostCard } from "@/components/pages/blog/post-card";
import { Cards } from "@/icons/cards";
import {
  getCategories,
  getFeatured,
  getPage,
  getTotalPages,
} from "@/services/blog";

export const metadata: Metadata = {
  title: "Blog | Prime Poker Team",
  description:
    "Estratégia, mindset e bastidores do Prime Poker Team. Conteúdo para quem leva o pôquer a sério.",
  alternates: { canonical: "/blog" },
};

type Props = { searchParams: Promise<{ q?: string; p?: string }> };

const GRID = "mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3";

export default async function BlogPage({ searchParams }: Props) {
  const [featured, categories] = await Promise.all([
    getFeatured(),
    getCategories(),
  ]);

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

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold text-prime-light text-xl uppercase">
            Em destaque
          </h2>
          <FeaturedCarousel posts={featured} />
        </section>
      )}

      <section className="mt-16">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<div className="h-14" />}>
            <BlogSearch />
          </Suspense>

          <CategoryNav categories={categories} />
        </div>

        {/* Os resultados dependem da URL, que só existe em tempo de
            requisição. Atrás do boundary, o cabeçalho, os destaques e a
            navegação continuam prerenderizados no shell estático. */}
        <Suspense fallback={<Esqueleto />}>
          <Resultados searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function Resultados({ searchParams }: Props) {
  const { q, p } = await searchParams;

  const search = q?.trim() ?? "";
  const pagina = Math.max(1, Number(p) || 1);
  const filtro = search ? { search } : {};

  const [posts, totalPages] = await Promise.all([
    getPage(pagina, filtro),
    getTotalPages(filtro),
  ]);

  if (posts.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 border-dashed p-16 text-center">
        <p className="text-prime-light">
          {search ? "Nada por aqui com esse termo." : "Nenhum artigo ainda."}
        </p>
      </div>
    );
  }

  // Durante a busca a paginação vive em `?q=&p=`; sem busca, nas rotas
  // indexáveis `/blog/pagina/N`.
  const hrefFor = (page: number) => {
    if (!search) return page <= 1 ? "/blog" : `/blog/pagina/${page}`;

    const params = new URLSearchParams({ q: search });
    if (page > 1) params.set("p", String(page));

    return `/blog?${params}`;
  };

  return (
    <>
      {search && (
        <p aria-live="polite" className="mt-6 text-prime-light/50 text-sm">
          Resultados para “{search}”
        </p>
      )}

      <div className={GRID}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Pagination current={pagina} total={totalPages} hrefFor={hrefFor} />
    </>
  );
}

function Esqueleto() {
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

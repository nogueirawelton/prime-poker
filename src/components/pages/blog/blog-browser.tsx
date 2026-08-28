"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Category, Post } from "./mock";
import { PostCard } from "./post-card";

function normalize(value: string) {
  // Sem acento e sem caixa: "estrategia" acha "Estratégia".
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

type Props = {
  /** Todos os posts — base da busca, que ignora a paginação. */
  allPosts: Array<Post>;
  /** Recorte da página atual, exibido quando não há busca ativa. */
  pagePosts: Array<Post>;
  categories: Array<Category>;
  /** Paginação renderizada no servidor, escondida durante a busca. */
  pagination?: React.ReactNode;
};

export function BlogBrowser({
  allPosts,
  pagePosts,
  categories,
  pagination,
}: Props) {
  const searchId = useId();
  const [term, setTerm] = useState("");

  // Mantém o input responsivo: a lista pode renderizar um frame atrás.
  const deferredTerm = useDeferredValue(term);
  const searching = deferredTerm.trim().length > 0;

  const results = useMemo(() => {
    const query = normalize(deferredTerm);
    if (!query) return pagePosts;

    return allPosts.filter((post) =>
      normalize(
        `${post.title} ${post.excerpt} ${post.category.name} ${post.author}`,
      ).includes(query),
    );
  }, [allPosts, pagePosts, deferredTerm]);

  const stale = term !== deferredTerm;

  return (
    <section className="mt-16">
      <div className="flex flex-col gap-6">
        <search>
          <label htmlFor={searchId} className="sr-only">
            Buscar artigos
          </label>

          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-prime-light/40"
              aria-hidden="true"
            />

            <input
              id={searchId}
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar por tema, autor ou palavra-chave..."
              className="h-14 w-full rounded-xl border border-white/10 bg-white/3 pr-12 pl-12 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60 lg:text-base"
            />

            {term && (
              <button
                type="button"
                onClick={() => setTerm("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-prime-light/40 transition-colors duration-500 hover:text-prime-light"
              >
                <XIcon className="size-5" />
              </button>
            )}
          </div>
        </search>

        {/* Links, e não botões de filtro: cada categoria tem URL própria e
            vira porta de entrada de busca orgânica. */}
        <nav aria-label="Categorias" className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/categoria/${category.slug}`}
              className="rounded-full border border-white/15 px-4 py-2 font-semibold text-prime-light/70 text-xs uppercase transition-all duration-500 hover:border-white/40 hover:text-prime-light"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      {searching && (
        <p aria-live="polite" className="mt-6 text-prime-light/50 text-sm">
          {results.length === 0
            ? "Nenhum artigo encontrado."
            : `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`}
        </p>
      )}

      {results.length > 0 ? (
        <div
          className={twMerge(
            "mt-6 grid gap-6 transition-opacity duration-200 md:grid-cols-2 lg:grid-cols-3",
            stale && "opacity-60",
          )}
        >
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-white/10 border-dashed p-16 text-center">
          <p className="text-prime-light">Nada por aqui com esse termo.</p>
          <button
            type="button"
            onClick={() => setTerm("")}
            className="mt-4 font-semibold text-prime-red text-sm uppercase underline underline-offset-4"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Paginação não faz sentido enquanto a busca varre o acervo inteiro. */}
      {!searching && pagination}
    </section>
  );
}

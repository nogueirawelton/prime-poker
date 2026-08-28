import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { getPage, TOTAL_PAGES } from "@/components/pages/blog/mock";
import { Pagination } from "@/components/pages/blog/pagination";
import { PostCard } from "@/components/pages/blog/post-card";

type Props = { params: Promise<{ page: string }> };

/** Só as páginas 2+ moram aqui; a 1 é a própria `/blog`. */
export function generateStaticParams() {
  return Array.from({ length: TOTAL_PAGES - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;

  return {
    title: `Blog — página ${page} | Prime Poker Team`,
    // Páginas internas de listagem não competem com a home nos buscadores.
    robots: { index: false, follow: true },
    alternates: { canonical: `/blog/pagina/${page}` },
  };
}

export default async function BlogPagePaginated({ params }: Props) {
  const { page } = await params;
  const current = Number(page);

  if (!Number.isInteger(current) || current < 2 || current > TOTAL_PAGES) {
    notFound();
  }

  const posts = getPage(current);

  return (
    <main>
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: `Página ${current}` },
        ]}
      />

      <h1 className="mt-4 font-black text-3xl text-prime-light uppercase lg:text-4xl">
        Todos os artigos
      </h1>
      <p className="mt-2 text-prime-light/70 text-sm">Página {current}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Pagination current={current} total={TOTAL_PAGES} />
    </main>
  );
}

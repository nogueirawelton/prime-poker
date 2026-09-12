import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorCard } from "@/components/pages/blog/author-card";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { PostCard } from "@/components/pages/blog/post-card";
import { PostComments } from "@/components/pages/blog/post-comments";
import { PostCover } from "@/components/pages/blog/post-cover";
import { PostFaq } from "@/components/pages/blog/post-faq";
import { PostSidebar } from "@/components/pages/blog/post-sidebar";
import { ReadingProgress } from "@/components/pages/blog/reading-progress";
import { ShareButtons } from "@/components/pages/blog/share-buttons";
import { getAulaSugerida } from "@/services/aulas";
import { getAllSlugs, getComments, getPost, getRelated } from "@/services/blog";
import { prepararConteudo } from "@/utils/rich-content";

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export async function generateStaticParams() {
  // Query dedicada, só com slugs: gerar as rotas não precisa de corpo,
  // imagem nem autor.
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const description = post.seoDescription || post.excerpt;

  return {
    title: post.seoTitle || `${post.title} | Prime Poker Team`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image.url }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [related, aula, comentarios] = await Promise.all([
    getRelated(post),
    // A chamada da lateral aponta para a aula do acervo que trata do mesmo
    // assunto; o título do post é o que aproxima os dois.
    getAulaSugerida(post.title, post.category?.slug),
    getComments(post.databaseId),
  ]);

  // Uma passada só no HTML do editor: ancora os títulos, monta o índice
  // lateral e separa o bloco de perguntas frequentes do corpo.
  const { html, secoes, faq } = prepararConteudo(post.content);

  return (
    <>
      <ReadingProgress />

      <article>
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            ...(post.category
              ? [
                  {
                    label: post.category.name,
                    href: `/blog/categoria/${post.category.slug}`,
                  },
                ]
              : []),
            { label: post.title },
          ]}
        />

        <header className="mt-4 flex flex-col gap-4">
          {post.category && (
            <Link
              href={`/blog/categoria/${post.category.slug}`}
              className="w-fit rounded-full bg-prime-red px-3 py-1 font-semibold text-prime-light text-xs uppercase transition-opacity duration-500 hover:opacity-85"
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="max-w-4xl font-black text-3xl text-prime-light uppercase leading-tight lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="max-w-3xl text-base text-prime-light/70 lg:text-lg">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-prime-light/60 text-sm">
            <span className="font-semibold text-prime-light">
              {post.author}
            </span>
            <time dateTime={post.date}>
              {dateFormatter.format(new Date(post.date))}
            </time>
            <span className="flex items-center gap-1">
              <ClockIcon className="size-4" />
              {post.readingTime} min de leitura
            </span>
          </div>
        </header>

        <PostCover
          post={post}
          variant="hero"
          priority
          className="mt-10 aspect-21/9 w-full rounded-xl"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {/* `rich-text` estiliza o HTML do WordPress; `max-w-3xl` mantém a
                linha em ~75 caracteres, que é a medida confortável de
                leitura. */}
            <div
              className="rich-text max-w-3xl"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <PostFaq perguntas={faq} />

            <AuthorCard post={post} />

            <footer className="mt-12 max-w-3xl border-white/10 border-t pt-8">
              <ShareButtons title={post.title} />
            </footer>

            <PostComments postId={post.databaseId} comentarios={comentarios} />
          </div>

          <PostSidebar
            secoes={secoes}
            relacionados={related.slice(0, 3)}
            aula={aula}
          />
        </div>
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

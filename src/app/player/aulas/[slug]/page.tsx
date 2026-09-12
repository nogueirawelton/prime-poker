import { EyeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { AulaAcoes } from "@/components/pages/player/aulas/aula-acoes";
import { AulaCard } from "@/components/pages/player/aulas/aula-card";
import { AulaPlayer } from "@/components/pages/player/aulas/aula-player";
import { Duvidas } from "@/components/pages/player/aulas/duvidas";
import { Materiais } from "@/components/pages/player/aulas/materiais";
import { getAula, getProximas } from "@/services/aula-detalhe";
import { formatarDuracao } from "@/services/aulas";

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const aula = await getAula(slug);

  if (!aula) return {};

  return { title: `${aula.titulo} | Prime Poker Team` };
}

export default function AulaPage({ params }: Props) {
  // A aula depende do slug e do estado do jogador, que só existem em tempo de
  // requisição: tudo atrás do boundary, como nas outras telas da área.
  return (
    <Suspense fallback={<Esqueleto />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: Props) {
  const { slug } = await params;
  const aula = await getAula(slug);

  if (!aula) notFound();

  const proximas = await getProximas(aula);

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Aulas", href: "/player/aulas" },
          {
            label: aula.categoria.nome,
            href: `/player/aulas?cat=${aula.categoria.slug}`,
          },
          { label: aula.titulo },
        ]}
      />

      <AulaPlayer capa={aula.categoria.capa} titulo={aula.titulo} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-bold text-2xl text-prime-light leading-tight lg:text-3xl">
            {aula.titulo}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-prime-light/60 text-sm">
            <span className="font-medium text-prime-light/80">
              {aula.instrutor}
            </span>
            <time dateTime={aula.data}>
              {dateFormatter.format(new Date(aula.data))}
            </time>
            <span>{formatarDuracao(aula.duracao)}</span>
            <span className="flex items-center gap-1.5">
              <EyeIcon className="size-4" aria-hidden="true" />
              {numberFormatter.format(aula.visualizacoes)} visualizações
            </span>
          </div>
        </div>

        <AulaAcoes
          slug={aula.slug}
          salva={aula.salva}
          concluida={aula.concluida}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Secao titulo="Descrição">
          {/* `rich-text` é a tipografia do conteúdo vindo do editor, a mesma
              usada nos posts do blog. */}
          <div
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: aula.descricao }}
          />
        </Secao>

        <Secao titulo="Material de apoio">
          <Materiais materiais={aula.materiais} />
        </Secao>
      </div>

      <Secao titulo="Dúvidas com o instrutor">
        <Duvidas
          slug={aula.slug}
          duvidas={aula.duvidas}
          instrutor={aula.instrutor}
        />
      </Secao>

      {proximas.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-prime-light uppercase">
            Continue na trilha {aula.categoria.nome}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {proximas.map((proxima) => (
              <AulaCard key={proxima.id} aula={proxima} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3">
      <h2 className="border-white/10 border-b px-5 py-4 font-bold text-prime-light text-sm uppercase tracking-wide">
        {titulo}
      </h2>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Esqueleto() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:px-8"
    >
      <div className="aspect-video w-full animate-pulse rounded-xl border border-white/10 bg-white/3" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-white/5" />
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/3" />
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/3" />
      </div>
    </div>
  );
}

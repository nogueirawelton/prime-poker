import type { Metadata } from "next";
import { Suspense } from "react";
import { GRID } from "@/components/pages/player/lessons/grid";
import { LessonsList } from "@/components/pages/player/lessons/lessons-list";
import { LessonsSearch } from "@/components/pages/player/lessons/lessons-search";
import { MobileTracks } from "@/components/shared/player/lessons-sidebar";
import { trackLinks } from "@/components/shared/player/track-links";
import {
  countFilters,
  type LessonsSearchParams,
  parseFilter,
} from "@/lib/lessons-params";
import {
  getInstructors,
  getTiers,
  getTracks,
  listLessons,
} from "@/services/lessons";

export const metadata: Metadata = {
  title: "Aulas | Prime Poker Team",
};

type Props = { searchParams: Promise<LessonsSearchParams> };

export default function LessonsPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-black text-3xl text-prime-light uppercase lg:text-4xl">
          Aulas
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Explore todo o nosso conteúdo estratégico.
        </p>
      </header>

      {/* Busca e resultados dependem da URL, que só existe em tempo de
          requisição. Atrás dos boundaries, o cabeçalho continua
          prerenderizado no shell estático. */}
      <Suspense fallback={<TracksSkeleton />}>
        <Tracks />
      </Suspense>

      <Suspense fallback={<ControlsSkeleton />}>
        <Controls searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Tracks() {
  return <MobileTracks tracks={await trackLinks()} />;
}

async function Controls({ searchParams }: Props) {
  const [params, tracks, instructors, tiers] = await Promise.all([
    searchParams,
    getTracks(),
    getInstructors(),
    getTiers(),
  ]);

  return (
    <LessonsSearch
      activeFilters={countFilters(parseFilter(params))}
      tracks={tracks}
      instructors={instructors}
      tiers={tiers}
    />
  );
}

async function Results({ searchParams }: Props) {
  const params = await searchParams;
  const filter = parseFilter(params);

  const { lessons, total, hasMore } = await listLessons(filter);

  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 border-dashed p-16 text-center">
        <p className="text-prime-light">
          Nenhuma aula encontrada com esses critérios.
        </p>
        <p className="mt-1 text-prime-light/50 text-sm">
          Tente outro termo ou limpe os filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p aria-live="polite" className="text-prime-light/70 text-sm">
        <strong className="font-bold text-prime-red">{total}</strong>{" "}
        {total === 1 ? "vídeo encontrado" : "vídeos encontrados"}
      </p>

      {/* A `key` derivada da URL descarta a lista acumulada quando o filtro
          muda — sem ela, os resultados antigos continuariam na rolagem. */}
      <LessonsList
        key={JSON.stringify(params)}
        initial={lessons}
        hasMore={hasMore}
        params={params}
      />
    </div>
  );
}

/**
 * Faixa de trilhas do mobile enquanto elas não chegam.
 *
 * Só aparece onde a faixa existe (`lg:hidden`), com a altura e o formato de
 * pílula dos chips reais. Larguras diferentes porque nomes de trilha têm
 * tamanhos diferentes — uma fileira de blocos idênticos não se parece com o
 * que vai entrar no lugar.
 */
function TracksSkeleton() {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-hidden px-4 lg:hidden"
      aria-hidden="true"
    >
      {["w-20", "w-28", "w-24", "w-32"].map((width) => (
        <div
          key={width}
          className={`h-10 shrink-0 animate-pulse rounded-full border border-white/10 bg-white/3 ${width}`}
        />
      ))}
    </div>
  );
}

/**
 * Busca e botão de filtros enquanto as trilhas e os instrutores não chegam.
 *
 * As medidas espelham as de `LessonsSearch` — `h-14` no campo, `size-14` no
 * botão —, para a barra não pular de tamanho quando o conteúdo entra.
 */
function ControlsSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="h-14 flex-1 animate-pulse rounded-xl border border-white/10 bg-white/3" />
      <div className="size-14 shrink-0 animate-pulse rounded-xl border border-white/10 bg-white/3" />
    </div>
  );
}

function Skeleton() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => index).map((index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/3"
        />
      ))}
    </div>
  );
}

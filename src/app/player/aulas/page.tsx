import type { Metadata } from "next";
import { Suspense } from "react";
import { AulasLista } from "@/components/pages/player/aulas/aulas-lista";
import { AulasSearch } from "@/components/pages/player/aulas/aulas-search";
import { GRID } from "@/components/pages/player/aulas/grid";
import { AulasTrilhasMobile } from "@/components/shared/player/aulas-sidebar";
import {
  type AulasSearchParams,
  contarFiltros,
  parseFiltro,
} from "@/lib/aulas-params";
import { listarAulas } from "@/services/aulas";

export const metadata: Metadata = {
  title: "Aulas | Prime Poker Team",
};

type Props = { searchParams: Promise<AulasSearchParams> };

export default function AulasPage({ searchParams }: Props) {
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
      <Suspense fallback={<div className="h-10 lg:hidden" />}>
        <AulasTrilhasMobile />
      </Suspense>

      <Suspense fallback={<div className="h-14" />}>
        <Controles searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<Esqueleto />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Controles({ searchParams }: Props) {
  const filtro = parseFiltro(await searchParams);

  return <AulasSearch filtrosAtivos={contarFiltros(filtro)} />;
}

async function Resultados({ searchParams }: Props) {
  const params = await searchParams;
  const filtro = parseFiltro(params);

  const { aulas, total, temMais } = await listarAulas(filtro);

  if (aulas.length === 0) {
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
      <AulasLista
        key={JSON.stringify(params)}
        inicial={aulas}
        temMais={temMais}
        params={params}
      />
    </div>
  );
}

function Esqueleto() {
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

"use client";

import {
  BookOpenIcon,
  BrainIcon,
  BriefcaseIcon,
  ChartLineUpIcon,
  type Icon,
  PlayCircleIcon,
  StrategyIcon,
  ToolboxIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { PARAMS } from "@/lib/aulas-params";
import { type Aula, CATEGORIAS, type CategoriaSlug } from "@/services/aulas";
import { ContinuarAssistindo } from "./continuar-assistindo";

const ICONES: Record<CategoriaSlug, Icon> = {
  estrategia: StrategyIcon,
  "mental-game": BrainIcon,
  torneios: TrophyIcon,
  "analise-de-maos": ChartLineUpIcon,
  fundamentos: BookOpenIcon,
  ferramentas: ToolboxIcon,
  profissional: BriefcaseIcon,
};

/**
 * Trilhas do acervo.
 *
 * São links, não botões: a categoria é estado de URL como o resto da
 * listagem, então cada trilha tem endereço próprio e o botão voltar funciona.
 * A busca digitada é preservada ao trocar de trilha; os demais filtros são
 * limpos, porque um filtro de instrutor herdado costuma zerar a nova trilha
 * sem que ninguém entenda o porquê.
 */
function useTrilhas() {
  const searchParams = useSearchParams();
  const atual = searchParams.get(PARAMS.categoria);
  const busca = searchParams.get(PARAMS.busca);

  function href(slug?: CategoriaSlug) {
    const params = new URLSearchParams();
    if (slug) params.set(PARAMS.categoria, slug);
    if (busca) params.set(PARAMS.busca, busca);

    const query = params.toString();
    return query ? `/player/aulas?${query}` : "/player/aulas";
  }

  return { atual, href };
}

export function AulasSidebar({ continuar }: { continuar: Aula | null }) {
  const { atual, href } = useTrilhas();

  return (
    // `fixed`, e não `sticky`: presa ao topo (abaixo do header, h-20) e ao
    // rodapé da janela, sem depender da altura do elemento pai — que é o que
    // fazia a coluna subir junto com a rolagem. O espaço dela na página vem
    // do `lg:pl-64` do conteúdo, no layout do segmento.
    <aside className="fixed top-20 bottom-0 left-0 z-30 hidden w-64 flex-col border-white/10 border-r bg-prime-dark lg:flex">
      <nav
        aria-label="Trilhas"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
      >
        <Item href={href()} icone={PlayCircleIcon} ativo={!atual}>
          Todas as Aulas
        </Item>

        {CATEGORIAS.map((categoria) => (
          <Item
            key={categoria.slug}
            href={href(categoria.slug)}
            icone={ICONES[categoria.slug]}
            ativo={atual === categoria.slug}
          >
            {categoria.nome}
          </Item>
        ))}
      </nav>

      {/* `mt-auto` empurra a retomada para o fim da tela; a navegação, com
          `flex-1`, ocupa o que sobra e rola por dentro. */}
      {continuar && (
        <div className="mt-auto shrink-0 border-white/10 border-t p-4">
          <ContinuarAssistindo aula={continuar} />
        </div>
      )}
    </aside>
  );
}

function Item({
  href,
  icone: Icone,
  ativo,
  children,
}: {
  href: string;
  icone: Icon;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={twMerge(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300",
        ativo
          ? "bg-prime-red/10 font-semibold text-prime-red"
          : "text-prime-light/70 hover:bg-white/5 hover:text-prime-light",
      )}
    >
      <Icone className="size-5" weight={ativo ? "fill" : "regular"} />
      {children}
    </Link>
  );
}

/**
 * As mesmas trilhas em faixa rolável, para quando a sidebar não cabe.
 *
 * Sem isso, o mobile perderia o único acesso às categorias — elas não estão
 * no painel de configurações, que trata de ordenação e filtros.
 */
export function AulasTrilhasMobile() {
  const { atual, href } = useTrilhas();

  return (
    <nav
      aria-label="Trilhas"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden"
    >
      <Chip href={href()} ativo={!atual}>
        Todas
      </Chip>

      {CATEGORIAS.map((categoria) => (
        <Chip
          key={categoria.slug}
          href={href(categoria.slug)}
          ativo={atual === categoria.slug}
        >
          {categoria.nome}
        </Chip>
      ))}
    </nav>
  );
}

function Chip({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={twMerge(
        "shrink-0 rounded-full border px-4 py-2 font-semibold text-xs uppercase transition-all duration-300",
        ativo
          ? "border-prime-red bg-prime-red/15 text-prime-light"
          : "border-white/15 text-prime-light/70 hover:border-white/40 hover:text-prime-light",
      )}
    >
      {children}
    </Link>
  );
}

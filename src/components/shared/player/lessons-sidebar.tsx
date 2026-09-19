"use client";

import { type Icon, PlayCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import type { Lesson, Track } from "@/lib/lessons";
import { PARAMS } from "@/lib/lessons-params";
import { ContinueWatching } from "./continue-watching";

/** O que a navegação precisa de cada trilha. */
type TrackLink = Pick<Track, "slug" | "name" | "dot">;

/**
 * Trilhas do acervo.
 *
 * São links, não botões: a categoria é estado de URL como o resto da
 * listagem, então cada trilha tem endereço próprio e o botão voltar funciona.
 * A busca digitada é preservada ao trocar de trilha; os demais filtros são
 * limpos, porque um filtro de instrutor herdado costuma zerar a nova trilha
 * sem que ninguém entenda o porquê.
 */
function useTracks() {
  const searchParams = useSearchParams();
  const current = searchParams.get(PARAMS.track);
  const search = searchParams.get(PARAMS.search);

  function href(slug?: string) {
    const params = new URLSearchParams();
    if (slug) params.set(PARAMS.track, slug);
    if (search) params.set(PARAMS.search, search);

    const query = params.toString();
    return query ? `/player/aulas?${query}` : "/player/aulas";
  }

  return { current, href };
}

export function LessonsSidebar({
  tracks,
  continueWatching,
}: {
  tracks: Array<TrackLink>;
  continueWatching: Lesson | null;
}) {
  const { current, href } = useTracks();

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
        <Item href={href()} icon={PlayCircleIcon} active={!current}>
          Todas as Aulas
        </Item>

        {tracks.map((track) => (
          <Item
            key={track.slug}
            href={href(track.slug)}
            dot={track.dot}
            active={current === track.slug}
          >
            {track.name}
          </Item>
        ))}
      </nav>

      {/* `mt-auto` empurra a retomada para o fim da tela; a navegação, com
          `flex-1`, ocupa o que sobra e rola por dentro. */}
      {continueWatching && (
        <div className="mt-auto shrink-0 border-white/10 border-t p-4">
          <ContinueWatching lesson={continueWatching} />
        </div>
      )}
    </aside>
  );
}

/**
 * Item da sidebar: "Todas as Aulas" leva ícone; cada trilha, a bolinha da cor
 * dela — a mesma do selo nos cards, que liga a lista à trilha.
 */
function Item({
  href,
  icon: ItemIcon,
  dot,
  active,
  children,
}: {
  href: string;
  icon?: Icon;
  dot?: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={twMerge(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300",
        active
          ? "bg-prime-red/10 font-semibold text-prime-red"
          : "text-prime-light/70 hover:bg-white/5 hover:text-prime-light",
      )}
    >
      {ItemIcon ? (
        <ItemIcon className="size-5" weight={active ? "fill" : "regular"} />
      ) : (
        <span className="flex size-5 items-center justify-center">
          <span className={twMerge("size-2.5 rounded-full", dot)} />
        </span>
      )}
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
export function MobileTracks({ tracks }: { tracks: Array<TrackLink> }) {
  const { current, href } = useTracks();

  return (
    <nav
      aria-label="Trilhas"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden"
    >
      <Chip href={href()} active={!current}>
        Todas
      </Chip>

      {tracks.map((track) => (
        <Chip
          key={track.slug}
          href={href(track.slug)}
          active={current === track.slug}
        >
          {track.name}
        </Chip>
      ))}
    </nav>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={twMerge(
        "shrink-0 rounded-full border px-4 py-2 font-semibold text-xs uppercase transition-all duration-300",
        active
          ? "border-prime-red bg-prime-red/15 text-prime-light"
          : "border-white/15 text-prime-light/70 hover:border-white/40 hover:text-prime-light",
      )}
    >
      {children}
    </Link>
  );
}

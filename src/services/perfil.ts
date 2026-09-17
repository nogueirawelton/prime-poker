import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { authQuery } from "@/graphql/auth-client";
import { VIEWER } from "@/graphql/queries/player/VIEWER";
import { getConcluidas } from "./aula-detalhe";
import { CATEGORIAS, type Categoria, getAcervo } from "./aulas";

/**
 * Perfil e progresso do jogador.
 *
 * O perfil vem do WordPress (`viewer`, com os campos de tier do plugin). O
 * progresso continua mock até as aulas existirem no CMS.
 */

export type TierSlug =
  | "player_free"
  | "player_basic"
  | "player_gold"
  | "player_platinum";

export type Tier = {
  slug: TierSlug;
  label: string;
  /** Classes do selo. */
  cor: string;
};

export type Perfil = {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  /** `null` para quem não tem tier — membro da equipe logado, por exemplo. */
  tier: Tier | null;
  /** ISO, ou `null` para tier sem vencimento. */
  expiraEm: string | null;
  membroDesde: string;
};

/**
 * Cor do selo por tier.
 *
 * O rótulo vem do WordPress (`playerTierLabel`), que é a fonte de verdade dos
 * nomes; só a aparência mora aqui, porque é decisão visual do front.
 */
const CORES: Record<TierSlug, string> = {
  player_free: "bg-white/5 text-prime-light/70 border-white/15",
  player_basic: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  player_gold: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  player_platinum: "bg-violet-500/15 text-violet-300 border-violet-400/40",
};

function ehTier(slug: string | null | undefined): slug is TierSlug {
  return !!slug && slug in CORES;
}

type ViewerResponse = {
  viewer: {
    databaseId: number;
    name: string | null;
    username: string;
    email: string | null;
    registeredDate: string | null;
    playerTier: string | null;
    playerTierLabel: string | null;
    playerTierExpiresAt: string | null;
  } | null;
};

/**
 * O jogador logado.
 *
 * `cache` do React deduplica dentro da mesma requisição: o menu do header e o
 * painel pedem o perfil, e isso vira uma ida só ao WordPress.
 */
export const getPerfil = cache(async (): Promise<Perfil> => {
  const { viewer } = await authQuery<ViewerResponse>(VIEWER);

  // Token aceito pelo proxy mas sem usuário no WordPress: conta excluída
  // depois do login, por exemplo. Não há perfil para mostrar.
  if (!viewer) redirect("/login");

  const slug = viewer.playerTier;

  return {
    id: viewer.databaseId,
    nome: viewer.name?.trim() || viewer.username,
    usuario: viewer.username,
    email: viewer.email ?? "",
    tier: ehTier(slug)
      ? {
          slug,
          label: viewer.playerTierLabel ?? slug,
          cor: CORES[slug],
        }
      : null,
    expiraEm: viewer.playerTierExpiresAt,
    membroDesde: viewer.registeredDate ?? new Date().toISOString(),
  };
});

/* -------------------------------------------------------------------------- */
/*                                  Progresso                                 */
/* -------------------------------------------------------------------------- */

export type ProgressoTrilha = {
  categoria: Categoria;
  concluidas: number;
  total: number;
};

export type Progresso = {
  concluidas: number;
  total: number;
  /** Horas assistidas, somando o progresso parcial de cada aula. */
  horas: number;
  /** Dias seguidos de estudo. */
  sequencia: number;
  trilhas: Array<ProgressoTrilha>;
};

/**
 * Números do painel.
 *
 * Uma aula conta como concluída quando o jogador a marcou como tal ou quando
 * passou de 95% dela — assistir aos créditos não deveria ser requisito.
 */
export async function getProgresso(): Promise<Progresso> {
  const [acervo, marcadas] = await Promise.all([getAcervo(), getConcluidas()]);

  const concluida = (slug: string, assistido: number, duracao: number) =>
    marcadas.has(slug) || assistido / duracao >= 0.95;

  const trilhas = CATEGORIAS.map((categoria) => {
    const daTrilha = acervo.filter(
      (aula) => aula.categoria.slug === categoria.slug,
    );

    return {
      categoria,
      concluidas: daTrilha.filter((aula) =>
        concluida(aula.slug, aula.assistido, aula.duracao),
      ).length,
      total: daTrilha.length,
    };
  });

  const segundos = acervo.reduce(
    (total, aula) =>
      total +
      (concluida(aula.slug, aula.assistido, aula.duracao)
        ? aula.duracao
        : aula.assistido),
    0,
  );

  return {
    concluidas: trilhas.reduce((total, trilha) => total + trilha.concluidas, 0),
    total: acervo.length,
    horas: Math.round(segundos / 3600),
    // TODO: sequência real depende de um histórico de sessões no CMS.
    sequencia: 7,
    trilhas,
  };
}

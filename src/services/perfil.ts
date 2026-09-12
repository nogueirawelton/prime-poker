import "server-only";

import { getConcluidas } from "./aula-detalhe";
import { CATEGORIAS, type Categoria, getAcervo } from "./aulas";

/**
 * Perfil e progresso do jogador.
 *
 * Mock, como o resto da área. O plugin do WordPress já expõe `playerTier`,
 * `playerTierLabel` e `playerTierExpiresAt` no tipo `User`, visíveis só para o
 * próprio usuário — quando houver um caminho GraphQL autenticado (o cliente
 * atual não envia o `Authorization`), `getPerfil` passa a ler de lá.
 */

export type Tier = {
  slug: "player_free" | "player_basic" | "player_gold" | "player_platinum";
  label: string;
  /** Classes do selo. */
  cor: string;
};

export type Perfil = {
  nome: string;
  usuario: string;
  email: string;
  tier: Tier;
  /** ISO, ou `null` para tier sem vencimento. */
  expiraEm: string | null;
  membroDesde: string;
};

export async function getPerfil(): Promise<Perfil> {
  return {
    nome: "Marcelo Celeste",
    usuario: "mr.celeste",
    email: "mr.celeste@exemplo.com",
    tier: {
      slug: "player_gold",
      label: "Player Gold",
      cor: "bg-amber-500/15 text-amber-400 border-amber-500/40",
    },
    expiraEm: new Date(Date.UTC(2026, 11, 31)).toISOString(),
    membroDesde: new Date(Date.UTC(2024, 4, 12)).toISOString(),
  };
}

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

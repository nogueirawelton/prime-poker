import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { authQuery } from "@/graphql/auth-client";
import { VIEWER } from "@/graphql/queries/player/VIEWER";
import type { Track } from "@/lib/lessons";
import { getCatalog, getTracks } from "./lessons";

/**
 * Perfil e progresso do jogador.
 *
 * Tudo vem do WordPress: o perfil e a sequência de estudo do `viewer` (com os
 * campos do plugin), o acervo e as trilhas das aulas. O progresso é soma do
 * que cada aula já traz para o jogador logado.
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
  color: string;
};

export type Profile = {
  id: number;
  name: string;
  username: string;
  email: string;
  /** `null` para quem não tem tier — membro da equipe logado, por exemplo. */
  tier: Tier | null;
  /** ISO, ou `null` para tier sem vencimento. */
  expiresAt: string | null;
  memberSince: string;
  /**
   * Dias seguidos de estudo.
   *
   * Mora aqui, e não no progresso, porque vem do mesmo `viewer`: buscar em
   * separado seria uma segunda ida ao WordPress pelo mesmo dado.
   */
  streak: number;
};

/**
 * Cor do selo por tier.
 *
 * O rótulo vem do WordPress (`playerTierLabel`), que é a fonte de verdade dos
 * nomes; só a aparência mora aqui, porque é decisão visual do front.
 */
const COLORS: Record<TierSlug, string> = {
  player_free: "bg-white/5 text-prime-light/70 border-white/15",
  player_basic: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  player_gold: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  player_platinum: "bg-violet-500/15 text-violet-300 border-violet-400/40",
};

function isTier(slug: string | null | undefined): slug is TierSlug {
  return !!slug && slug in COLORS;
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
    studyStreak: number;
  } | null;
};

/**
 * O jogador logado.
 *
 * `cache` do React deduplica dentro da mesma requisição: o menu do header e o
 * painel pedem o perfil, e isso vira uma ida só ao WordPress.
 */
export const getProfile = cache(async (): Promise<Profile> => {
  const { viewer } = await authQuery<ViewerResponse>(VIEWER);

  // Token aceito pelo proxy mas sem usuário no WordPress: conta excluída
  // depois do login, por exemplo. Não há perfil para mostrar.
  if (!viewer) redirect("/login");

  const slug = viewer.playerTier;

  return {
    id: viewer.databaseId,
    name: viewer.name?.trim() || viewer.username,
    username: viewer.username,
    email: viewer.email ?? "",
    tier: isTier(slug)
      ? {
          slug,
          label: viewer.playerTierLabel ?? slug,
          color: COLORS[slug],
        }
      : null,
    expiresAt: viewer.playerTierExpiresAt,
    memberSince: viewer.registeredDate ?? new Date().toISOString(),
    streak: viewer.studyStreak,
  };
});

/* -------------------------------------------------------------------------- */
/*                                  Progresso                                 */
/* -------------------------------------------------------------------------- */

export type TrackProgress = {
  track: Track;
  completedCount: number;
  total: number;
};

export type Progress = {
  completedCount: number;
  total: number;
  /** Horas assistidas, somando o progresso parcial de cada aula. */
  hours: number;
  /** Dias seguidos de estudo. */
  streak: number;
  tracks: Array<TrackProgress>;
};

/**
 * Números do painel.
 *
 * Quem decide o que está concluído é o WordPress: o jogador marcou na mão ou
 * passou de 90% da aula. Aqui é só soma.
 */
export async function getProgress(): Promise<Progress> {
  const [catalog, trackList, viewer] = await Promise.all([
    getCatalog(),
    getTracks(),
    getProfile(),
  ]);

  const tracks = trackList.map((track) => {
    const trackLessons = catalog.filter(
      (lesson) => lesson.track?.slug === track.slug,
    );

    return {
      track,
      completedCount: trackLessons.filter((lesson) => lesson.completed).length,
      total: trackLessons.length,
    };
  });

  // Aula concluída conta cheia: quem marcou na mão sem chegar ao fim do
  // vídeo ainda assistiu a aula.
  const seconds = catalog.reduce(
    (total, lesson) =>
      total + (lesson.completed ? lesson.duration : lesson.watched),
    0,
  );

  return {
    completedCount: tracks.reduce(
      (total, track) => total + track.completedCount,
      0,
    ),
    total: catalog.length,
    hours: Math.round(seconds / 3600),
    streak: viewer.streak,
    tracks,
  };
}

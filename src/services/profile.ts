import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { authQuery } from "@/graphql/auth-client";
import { VIEWER } from "@/graphql/queries/player/VIEWER";
import type { Track } from "@/lib/lessons";
import { getCompletedSlugs } from "./lesson-detail";
import { getCatalog, getTracks } from "./lessons";

/**
 * Perfil e progresso do jogador.
 *
 * O perfil vem do WordPress (`viewer`, com os campos de tier do plugin). O
 * acervo e as trilhas também; o progresso por jogador (assistido, concluídas,
 * sequência) continua mock até a etapa 8.
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
 * Uma aula conta como concluída quando o jogador a marcou como tal ou quando
 * passou de 95% dela — assistir aos créditos não deveria ser requisito.
 */
export async function getProgress(): Promise<Progress> {
  const [catalog, trackList, markedCompleted] = await Promise.all([
    getCatalog(),
    getTracks(),
    getCompletedSlugs(),
  ]);

  const completed = (slug: string, watched: number, duration: number) =>
    markedCompleted.has(slug) || (duration > 0 && watched / duration >= 0.95);

  const tracks = trackList.map((track) => {
    const trackLessons = catalog.filter(
      (lesson) => lesson.track?.slug === track.slug,
    );

    return {
      track,
      completedCount: trackLessons.filter((lesson) =>
        completed(lesson.slug, lesson.watched, lesson.duration),
      ).length,
      total: trackLessons.length,
    };
  });

  const seconds = catalog.reduce(
    (total, lesson) =>
      total +
      (completed(lesson.slug, lesson.watched, lesson.duration)
        ? lesson.duration
        : lesson.watched),
    0,
  );

  return {
    completedCount: tracks.reduce(
      (total, track) => total + track.completedCount,
      0,
    ),
    total: catalog.length,
    hours: Math.round(seconds / 3600),
    // TODO: sequência real depende de um histórico de sessões no CMS.
    streak: 7,
    tracks,
  };
}

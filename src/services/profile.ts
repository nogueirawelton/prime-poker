import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authMutate, authQuery } from "@/graphql/auth-client";
import {
  UPDATE_PLAYER_PASSWORD,
  UPDATE_PLAYER_PROFILE,
} from "@/graphql/mutations/player/PROFILE";
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
  /** WhatsApp só com dígitos (DDI + DDD + número), ou vazio. */
  phone: string;
  /** Onde o jogador mora, texto livre. */
  city: string;
  /** Apresentação curta que o jogador escreve sobre si. */
  bio: string;
  /** Foto enviada pelo jogador; `null` cai nas iniciais do nome. */
  avatarUrl: string | null;
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
    description: string | null;
    registeredDate: string | null;
    playerTier: string | null;
    playerTierLabel: string | null;
    playerTierExpiresAt: string | null;
    playerPhone: string | null;
    playerCity: string | null;
    playerAvatarUrl: string | null;
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
    phone: viewer.playerPhone ?? "",
    city: viewer.playerCity ?? "",
    bio: viewer.description ?? "",
    avatarUrl: viewer.playerAvatarUrl,
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

/* -------------------------------------------------------------------------- */
/*                              Edição do perfil                              */
/* -------------------------------------------------------------------------- */

/** O que a tela de perfil deixa o jogador mudar. */
type ProfileInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
};

/**
 * Grava o perfil do jogador logado.
 *
 * O WordPress é quem valida: e-mail já usado por outra conta, nome vazio e
 * afins voltam como erro da mutation, com a mensagem pronta para a tela.
 */
export async function updateProfile(input: ProfileInput) {
  await authMutate(UPDATE_PLAYER_PROFILE, input);
}

/** Troca a senha. A atual é conferida no WordPress, nunca aqui. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  await authMutate(UPDATE_PLAYER_PASSWORD, { currentPassword, newPassword });
}

/**
 * Rota REST da foto de perfil.
 *
 * A foto não vai pelo GraphQL porque o WPGraphQL não recebe arquivo: mandá-la
 * em base64 dentro do JSON custaria um terço a mais de tráfego e memória. O
 * plugin aceita o mesmo Bearer do GraphQL nesta rota.
 */
const AVATAR_ENDPOINT = `${process.env.NEXT_PUBLIC_ADMIN_URL}/wp-json/prime-poker/v1/avatar`;

async function avatarRequest(init: RequestInit) {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) redirect("/login");

  const response = await fetch(AVATAR_ENDPOINT, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // O WordPress responde erro em JSON com `message`; é a frase que o jogador
  // precisa ler ("envie JPG, PNG ou WebP"), então ela sobe como está.
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(
      body?.message || "Não foi possível salvar a foto. Tente novamente.",
    );
  }

  return response.json() as Promise<{ url: string | null }>;
}

/** Envia a foto de perfil. A anterior é apagada pelo plugin. */
export async function uploadAvatar(file: File) {
  const body = new FormData();
  body.append("file", file);

  return avatarRequest({ method: "POST", body });
}

/** Remove a foto e volta ao avatar padrão. */
export async function removeAvatar() {
  return avatarRequest({ method: "DELETE" });
}

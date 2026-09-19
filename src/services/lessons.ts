import "server-only";

import { cache } from "react";
import { authQuery } from "@/graphql/auth-client";
import { optionalQuery, query } from "@/graphql/client";
import {
  LESSON,
  LESSON_INSTRUCTORS,
  LESSON_SUGGESTION,
  LESSON_TRACKS,
  LESSONS,
} from "@/graphql/queries/player/LESSONS";
import { LESSONS_CACHE_TAG } from "@/lib/cache-tags";
import {
  type Instructor,
  LEVELS,
  type Lesson,
  type LessonFilter,
  type LessonSuggestion,
  type LessonsResult,
  type Level,
  PAGE_SIZE,
  type SortOrder,
  type Track,
  trackStyle,
} from "@/lib/lessons";

/**
 * Acervo de aulas, vindo do WordPress (plugin `prime-poker`, módulo `Lessons`).
 *
 * Tudo que é por jogador — a listagem, a aula, o `canWatch` — vai pelo
 * `authQuery`, sem cache: a mesma aula chega com vídeo para um e trancada
 * para outro. Só o que é igual para todos (trilhas, instrutores, a sugestão
 * do blog) passa pelo `query()` cacheado, sob a tag `lessons`.
 */

/* -------------------------------------------------------------------------- */
/*                               Respostas do WP                              */
/* -------------------------------------------------------------------------- */

type TrackNode = {
  slug: string;
  name: string;
  trackFields: {
    badge: string | null;
    // `select` do ACF chega como lista, mesmo sendo de escolha única.
    color: Array<string> | null;
    order?: number | null;
  } | null;
};

type LessonNode = {
  databaseId: number;
  slug: string;
  title: string | null;
  date: string;
  canWatch: boolean;
  minimumTier: string;
  minimumTierLabel: string;
  duration: number | null;
  viewCount: number;
  featuredImage: { node: { sourceUrl: string | null } } | null;
  lessonFields: {
    level: Array<string> | null;
    instructor: { nodes: Array<{ title?: string | null }> } | null;
  } | null;
  trilhas: { nodes: Array<TrackNode> } | null;
};

export type LessonDetailNode = LessonNode & {
  content: string | null;
  video: { provider: string; url: string | null } | null;
  materials: Array<{
    name: string;
    url: string;
    fileSize: number | null;
  }> | null;
};

/* -------------------------------------------------------------------------- */
/*                                  Conversão                                 */
/* -------------------------------------------------------------------------- */

function toTrack(node: TrackNode): Track {
  return {
    slug: node.slug,
    name: node.name,
    badge: node.trackFields?.badge?.trim() || node.name,
    ...trackStyle(node.trackFields?.color?.[0]),
  };
}

function isLevel(value: string | undefined): value is Level {
  return LEVELS.includes(value as Level);
}

export function toLesson(node: LessonNode): Lesson {
  const track = node.trilhas?.nodes[0];
  const level = node.lessonFields?.level?.[0];

  return {
    id: String(node.databaseId),
    databaseId: node.databaseId,
    slug: node.slug,
    title: node.title ?? "",
    track: track ? toTrack(track) : null,
    instructor: node.lessonFields?.instructor?.nodes[0]?.title ?? "",
    level: isLevel(level) ? level : null,
    duration: node.duration ?? 0,
    // Progresso por jogador chega na etapa 8.
    watched: 0,
    // Hora do site, sem fuso: lida e formatada no mesmo fuso, sai igual.
    data: node.date,
    views: node.viewCount,
    image: node.featuredImage?.node.sourceUrl ?? null,
    canWatch: node.canWatch,
    minimumTier: { slug: node.minimumTier, label: node.minimumTierLabel },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Listagem                                  */
/* -------------------------------------------------------------------------- */

/** Ordens da URL → `LessonSortEnum` do plugin. */
const SORTS: Record<SortOrder, string> = {
  recentes: "NEWEST",
  antigas: "OLDEST",
  populares: "MOST_VIEWED",
  curtas: "SHORTEST",
  longas: "LONGEST",
};

type LessonsResponse = {
  aulas: { nodes: Array<LessonNode> };
  lessonsTotal: number | null;
};

/**
 * Uma página da listagem.
 *
 * O WordPress filtra, ordena e pagina (`offset`); o total vem na mesma ida,
 * e é ele que diz se há próxima página.
 */
export async function listLessons(
  filter: LessonFilter = {},
  page = 1,
): Promise<LessonsResult> {
  const offset = (Math.max(1, page) - 1) * PAGE_SIZE;
  const filters = {
    search: filter.search,
    track: filter.track,
    instructor: filter.instructor,
    from: filter.from,
    to: filter.to,
  };

  const data = await authQuery<LessonsResponse>(LESSONS, {
    first: PAGE_SIZE,
    where: { ...filters, offset, sort: SORTS[filter.order ?? "recentes"] },
    ...filters,
  });

  const lessons = data.aulas.nodes.map(toLesson);
  const total = data.lessonsTotal ?? 0;

  return {
    lessons,
    total,
    hasMore: offset + lessons.length < total,
  };
}

/**
 * O acervo inteiro, de 100 em 100 (o máximo do WPGraphQL por página).
 *
 * Serve às estatísticas do painel e às aulas salvas, não à listagem.
 */
export async function getCatalog(): Promise<Array<Lesson>> {
  const lessons: Array<Lesson> = [];

  for (let offset = 0; ; offset += 100) {
    const data = await authQuery<LessonsResponse>(LESSONS, {
      first: 100,
      where: { offset, sort: SORTS.recentes },
    });

    lessons.push(...data.aulas.nodes.map(toLesson));

    if (data.aulas.nodes.length < 100) return lessons;
  }
}

/**
 * Uma aula pelo slug, com descrição, vídeo e materiais; `null` quando não
 * existe (ou quando quem pede não é jogador).
 *
 * `cache` do React: os metadados e o corpo da página pedem a mesma aula, e
 * isso vira uma ida só ao WordPress.
 */
export const getLessonNode = cache(
  async (slug: string): Promise<LessonDetailNode | null> => {
    const data = await authQuery<{ aula: LessonDetailNode | null }>(LESSON, {
      slug,
    });

    return data.aula;
  },
);

/* -------------------------------------------------------------------------- */
/*                          Trilhas e instrutores                             */
/* -------------------------------------------------------------------------- */

/**
 * Trilhas com ao menos uma aula publicada, na ordem do campo `order`.
 *
 * Iguais para todos os jogadores, então cacheadas: o plugin limpa a tag
 * `lessons` ao salvar aula ou trilha.
 */
export async function getTracks(): Promise<Array<Track>> {
  const data = await query<{ trilhas: { nodes: Array<TrackNode> } }>(
    LESSON_TRACKS,
    { tags: [LESSONS_CACHE_TAG] },
  );

  return [...data.trilhas.nodes]
    .sort(
      (a, b) =>
        (a.trackFields?.order ?? 0) - (b.trackFields?.order ?? 0) ||
        a.name.localeCompare(b.name, "pt-BR"),
    )
    .map(toTrack);
}

/** Instrutores do filtro, em ordem alfabética. */
export async function getInstructors(): Promise<Array<Instructor>> {
  const data = await query<{
    instrutores: { nodes: Array<{ databaseId: number; title: string }> };
  }>(LESSON_INSTRUCTORS, { tags: [LESSONS_CACHE_TAG] });

  return data.instrutores.nodes.map((node) => ({
    id: node.databaseId,
    name: node.title,
  }));
}

/* -------------------------------------------------------------------------- */
/*                                  Sugestões                                 */
/* -------------------------------------------------------------------------- */

/**
 * A aula mais próxima de um assunto — liga um post do blog à aula
 * correspondente. A escolha é do plugin (`lessonSuggestion`); `null` quando
 * nenhuma aula tem palavra em comum com o assunto.
 */
export async function getSuggestedLesson(
  subject: string,
  trackSlug?: string,
): Promise<LessonSuggestion | null> {
  // Um extra da lateral: se falhar (WP fora, plugin antigo sem o campo), o
  // post continua de pé com a chamada institucional no lugar.
  const data = await optionalQuery<{
    lessonSuggestion: {
      slug: string;
      title: string;
      instructor: string | null;
      duration: number | null;
    } | null;
  }>(LESSON_SUGGESTION, {
    variables: { subject, track: trackSlug },
    tags: [LESSONS_CACHE_TAG],
  });

  const suggestion = data?.lessonSuggestion;

  return suggestion
    ? {
        slug: suggestion.slug,
        title: suggestion.title,
        instructor: suggestion.instructor ?? "",
        duration: suggestion.duration ?? 0,
      }
    : null;
}

/**
 * A aula mais recente ainda em andamento — o card fixo da sidebar.
 *
 * O progresso por jogador ainda não é gravado (etapa 8): até lá não há aula
 * em andamento, e a sidebar não mostra o card.
 */
export async function getContinueWatching(): Promise<Lesson | null> {
  return null;
}

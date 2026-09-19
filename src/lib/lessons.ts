/**
 * Tipos e utilitários das aulas que o navegador também usa.
 *
 * Separado de `services/lessons.ts` porque aquele fala com o WordPress em
 * nome do jogador (`server-only`): um componente cliente que importasse de lá
 * levaria o cliente autenticado para o bundle — e o build recusa.
 */

/* -------------------------------------------------------------------------- */
/*                                   Trilhas                                  */
/* -------------------------------------------------------------------------- */

export type Track = {
  slug: string;
  /** Nome completo, usado na sidebar. */
  name: string;
  /** Nome curto para o selo sobre a capa. */
  badge: string;
  /** Classes do selo. */
  color: string;
  /** Gradiente da capa quando a aula não tem imagem destacada. */
  cover: string;
  /** Classe da bolinha que identifica a trilha na sidebar. */
  dot: string;
};

type TrackStyle = Pick<Track, "color" | "cover" | "dot">;

/**
 * Aparência por cor da trilha.
 *
 * As chaves são os valores do select `color` no ACF (`trackFields`). Cor nova
 * lá exige entrada aqui — sem ela a trilha cai na primeira. As classes ficam
 * escritas por extenso para o Tailwind encontrá-las.
 */
const TRACK_STYLES: Record<string, TrackStyle> = {
  vermelho: {
    color: "bg-prime-red text-prime-light",
    cover: "from-prime-red/40 via-prime-darkgray to-prime-dark",
    dot: "bg-prime-red",
  },
  esmeralda: {
    color: "bg-emerald-600 text-prime-light",
    cover: "from-emerald-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-emerald-500",
  },
  violeta: {
    color: "bg-violet-600 text-prime-light",
    cover: "from-violet-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-violet-500",
  },
  laranja: {
    color: "bg-orange-500 text-prime-dark",
    cover: "from-orange-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-orange-500",
  },
  azul: {
    color: "bg-blue-600 text-prime-light",
    cover: "from-blue-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-blue-500",
  },
  indigo: {
    color: "bg-indigo-600 text-prime-light",
    cover: "from-indigo-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-indigo-500",
  },
  ambar: {
    color: "bg-amber-500 text-prime-dark",
    cover: "from-amber-500/35 via-prime-darkgray to-prime-dark",
    dot: "bg-amber-500",
  },
};

export function trackStyle(colorKey: string | null | undefined): TrackStyle {
  return TRACK_STYLES[colorKey ?? ""] ?? TRACK_STYLES.vermelho;
}

/** Capa de aula sem trilha e sem imagem. */
export const NEUTRAL_COVER = "from-white/10 via-prime-darkgray to-prime-dark";

/* -------------------------------------------------------------------------- */
/*                                    Aulas                                   */
/* -------------------------------------------------------------------------- */

export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export type Instructor = { id: number; name: string };

export type Lesson = {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  /** `null` quando a aula ainda não foi posta em nenhuma trilha. */
  track: Track | null;
  /** Nome do instrutor; vazio quando não informado. */
  instructor: string;
  level: Level | null;
  /** Duração em segundos; 0 quando não informada. */
  duration: number;
  /** Segundos já assistidos pelo jogador. */
  watched: number;
  /** Publicação, em ISO. */
  data: string;
  views: number;
  /** Imagem destacada; sem ela a capa é o gradiente da trilha. */
  image: string | null;
  /** O jogador tem o tier mínimo? Sem ele o card aparece com cadeado. */
  canWatch: boolean;
  minimumTier: { slug: string; label: string };
};

/** O que um post do blog mostra da aula sugerida — é público. */
export type LessonSuggestion = {
  slug: string;
  title: string;
  instructor: string;
  duration: number;
};

/** Quantas aulas cada rolagem traz. */
export const PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/*                            Filtros e ordenação                             */
/* -------------------------------------------------------------------------- */

export const SORT_ORDERS = [
  "recentes",
  "antigas",
  "populares",
  "curtas",
  "longas",
] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const ORDER_LABEL: Record<SortOrder, string> = {
  recentes: "Mais recentes",
  antigas: "Mais antigas",
  populares: "Mais assistidas",
  curtas: "Menor duração",
  longas: "Maior duração",
};

/** Estado completo da listagem — espelha os parâmetros da URL. */
export type LessonFilter = {
  search?: string;
  /** Slug da trilha: o mesmo parâmetro que a sidebar controla. */
  track?: string;
  /** ID do instrutor no WordPress. */
  instructor?: number;
  /** Intervalo de publicação, em `AAAA-MM-DD`. Os dois lados são opcionais. */
  from?: string;
  to?: string;
  order?: SortOrder;
};

export type LessonsResult = {
  lessons: Array<Lesson>;
  /** Total de resultados do filtro, não do acervo. */
  total: number;
  /** Se existe página seguinte — é o que destrava a rolagem infinita. */
  hasMore: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                 Formatação                                 */
/* -------------------------------------------------------------------------- */

/** `1125` → `18:45`; `3900` → `1:05:00`. */
export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.floor(seconds % 60);
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(remainder)}`
    : `${minutes}:${pad(remainder)}`;
}

/** Quanto da aula já foi assistido, de 0 a 100. */
export function watchedPercentage(
  lesson: Pick<Lesson, "watched" | "duration">,
) {
  if (lesson.duration <= 0) return 0;

  return Math.min(100, Math.round((lesson.watched / lesson.duration) * 100));
}

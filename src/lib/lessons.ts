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
  /** Cor da trilha em hex, escolhida no painel (`trackFields.color`). */
  color: string;
  /** Nome do ícone no Phosphor, cadastrado no painel; sem ele, a bolinha. */
  icon: string | null;
};

/** Cor de trilha sem cor válida cadastrada — o vermelho do site. */
const FALLBACK_COLOR = "#ff1820";

/**
 * Normaliza o que veio do painel.
 *
 * O seletor do ACF devolve `#rrggbb`, mas o campo é texto no banco: pode
 * chegar vazio (trilha antiga), abreviado ou preenchido na mão.
 */
export function trackColor(value: string | null | undefined): string {
  const color = (value ?? "").trim();

  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();

  // `#abc` → `#aabbcc`.
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return FALLBACK_COLOR;
}

/**
 * Preto ou branco sobre a cor da trilha.
 *
 * Usa o brilho percebido (média do YIQ, que pesa muito mais o verde do que o
 * azul): amarelo e verde pedem texto preto; vermelho, violeta e azul, branco.
 *
 * Não é a luminância da WCAG de propósito. Por ela, o vermelho da marca
 * (`#ff1820`) levaria texto preto — e o site inteiro usa branco sobre ele,
 * nos botões e nos selos. Num selo de 10px, seguir a fórmula deixaria a
 * identidade inconsistente sem ganho real de leitura.
 */
export function readableOn(color: string): string {
  const channel = (hex: string) => Number.parseInt(hex, 16);

  const brightness =
    (channel(color.slice(1, 3)) * 299 +
      channel(color.slice(3, 5)) * 587 +
      channel(color.slice(5, 7)) * 114) /
    1000;

  return brightness >= 128 ? "#000000" : "#ffffff";
}

/** Selo da trilha sobre a capa. */
export function badgeStyle(color: string) {
  return { backgroundColor: color, color: readableOn(color) };
}

/** Bolinha da trilha na sidebar. */
export function dotStyle(color: string) {
  return { backgroundColor: color };
}

/**
 * Capa da aula sem imagem destacada: a cor da trilha esmaecendo até o preto.
 * Sem trilha, um cinza neutro.
 */
export function coverStyle(color: string | null) {
  const start = color ? `${color}59` : "rgba(255,255,255,0.1)";

  return {
    backgroundImage: `linear-gradient(to bottom right, ${start}, #27272a, #000000)`,
  };
}

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
  /** Foto do instrutor (imagem destacada do Instrutor); sem ela, as iniciais. */
  instructorImage: string | null;
  level: Level | null;
  /** Duração em segundos; 0 quando não informada. */
  duration: number;
  /** Onde o jogador parou, em segundos. */
  watched: number;
  /** O jogador salvou esta aula? */
  saved: boolean;
  /** Concluída, na mão ou por ter passado de 90%. */
  completed: boolean;
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
  /** Slug do tier mínimo da aula (`player_gold`). */
  tier?: string;
  /** Nível da aula: `iniciante`, `intermediario` ou `avancado`. */
  level?: Level;
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

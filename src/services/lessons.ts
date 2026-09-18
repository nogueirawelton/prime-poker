/**
 * Acervo de aulas da área do jogador.
 *
 * O WordPress ainda não expõe um CPT de aulas, então o catálogo aqui é um
 * mock determinístico: mesma entrada, mesma saída em qualquer processo. Toda a
 * UI conversa só com `listLessons` / `getContinueWatching`, então trocar
 * este arquivo por consultas ao WPGraphQL (nos moldes de `services/blog.ts`)
 * não toca em nenhum componente.
 */

export type TrackSlug =
  | "estrategia"
  | "mental-game"
  | "torneios"
  | "analise-de-maos"
  | "fundamentos"
  | "ferramentas"
  | "profissional";

export type Track = {
  slug: TrackSlug;
  /** Nome completo, usado na sidebar. */
  name: string;
  /** Nome curto para o selo sobre a capa. */
  badge: string;
  /** Classes do selo — cores fora da paleta base identificam a trilha. */
  color: string;
  /** Gradiente da capa enquanto não há thumbnail real. */
  cover: string;
};

export const TRACKS: Array<Track> = [
  {
    slug: "estrategia",
    name: "Estratégia",
    badge: "Estratégia",
    color: "bg-prime-red text-prime-light",
    cover: "from-prime-red/40 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "mental-game",
    name: "Mental Game",
    badge: "Mental Game",
    color: "bg-emerald-600 text-prime-light",
    cover: "from-emerald-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "torneios",
    name: "Torneios",
    badge: "Torneios",
    color: "bg-violet-600 text-prime-light",
    cover: "from-violet-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "analise-de-maos",
    name: "Análise de Mãos",
    badge: "Análise",
    color: "bg-orange-500 text-prime-dark",
    cover: "from-orange-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "fundamentos",
    name: "Fundamentos",
    badge: "Fundamentos",
    color: "bg-blue-600 text-prime-light",
    cover: "from-blue-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "ferramentas",
    name: "Ferramentas",
    badge: "Ferramentas",
    color: "bg-indigo-600 text-prime-light",
    cover: "from-indigo-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "profissional",
    name: "Profissional",
    badge: "Profissional",
    color: "bg-amber-500 text-prime-dark",
    cover: "from-amber-500/35 via-prime-darkgray to-prime-dark",
  },
];

export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const INSTRUCTORS = [
  "Felipe Martins",
  "Carla Mendes",
  "Rafael Moraes",
  "Lucas Rocha",
] as const;

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  track: Track;
  instructor: string;
  level: Level;
  /** Duração em segundos. */
  duration: number;
  /** Segundos já assistidos pelo jogador. */
  watched: number;
  /** Publicação, em ISO — a ordenação por data usa este campo. */
  data: string;
  views: number;
};

/** Quantas aulas cada rolagem traz. */
export const PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/*                                  Catálogo                                  */
/* -------------------------------------------------------------------------- */

/**
 * Gerador congruente linear.
 *
 * `Math.random()` daria um catálogo diferente a cada render — e, com o servidor
 * paginando, a página 2 não seria a continuação da 1.
 */
function seededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const TITLES: Record<TrackSlug, Array<string>> = {
  estrategia: [
    "Como Explorar Range Advantage no Flop",
    "Barrel de Continuação: Quando e Como Usar",
    "Blefes Polarizados no River",
    "Defesa de Big Blind Contra Open Raise",
    "Squeeze Play em Mesas Agressivas",
    "Check-Raise como Arma de Pressão",
  ],
  "mental-game": [
    "Controle Emocional em Situações de Tilt",
    "Disciplina e Rotina para Jogadores de Poker",
    "Como Lidar com Downswings Longos",
    "Foco e Atenção em Sessões Longas",
    "Confiança sem Arrogância na Mesa",
  ],
  torneios: [
    "ICM na Prática: Fases Finais de Torneios",
    "Push or Fold com Stack Curto",
    "Bubble Factor e Decisões de Risco",
    "Ajustes de Range em Mesa Final",
    "Gestão de Stack Médio no Middle Game",
  ],
  "analise-de-maos": [
    "Analisando Jogadas com Solver: Parte 1",
    "Analisando Jogadas com Solver: Parte 2",
    "Revisão de Mãos Marcadas da Semana",
    "Leitura de Linhas Passivas do Vilão",
    "Erros Comuns em Spots de 3-Bet Pot",
  ],
  fundamentos: [
    "Princípios Básicos que Todo Jogador Precisa Saber",
    "Posição: o Fundamento que Mais Rende",
    "Odds e Equity sem Complicação",
    "Construindo Ranges de Abertura",
    "Value Bet: Extraindo o Máximo",
  ],
  ferramentas: [
    "Como Usar o Tracker para Evoluir Mais Rápido",
    "Configurando seu HUD do Zero",
    "Primeiros Passos no Solver",
    "Organizando sua Base de Mãos",
    "Relatórios que Realmente Importam",
  ],
  profissional: [
    "Gestão de Banca para Virar Profissional",
    "Rotina e Volume de um Jogador Profissional",
    "Planejamento Financeiro e Impostos",
    "Metas de Carreira e Progressão de Limites",
    "Staking: Como Funciona na Prática",
  ],
};

/** Tamanho do acervo simulado. */
const CATALOG_SIZE = 128;

const CATALOG: Array<Lesson> = (() => {
  const random = seededRandom(20260830);
  const now = Date.UTC(2026, 7, 30);
  const lessons: Array<Lesson> = [];

  for (let i = 0; i < CATALOG_SIZE; i++) {
    const track = TRACKS[i % TRACKS.length];
    const titles = TITLES[track.slug];
    const title = titles[Math.floor(random() * titles.length)];
    const duration = Math.floor(600 + random() * 1200);
    const progressRatio = random();

    lessons.push({
      id: `aula-${i + 1}`,
      slug: `${track.slug}-${i + 1}`,
      // O acervo real terá títulos únicos; aqui o índice evita repetição.
      title: i < titles.length ? title : `${title} #${i + 1}`,
      track,
      instructor: INSTRUCTORS[Math.floor(random() * INSTRUCTORS.length)],
      level: LEVELS[Math.floor(random() * LEVELS.length)],
      duration,
      // Só parte do acervo tem progresso: a maioria nunca foi aberta.
      watched:
        progressRatio > 0.75 ? Math.floor(duration * (progressRatio - 0.7)) : 0,
      data: new Date(now - i * 86400000 * 2).toISOString(),
      views: Math.floor(random() * 4000),
    });
  }

  return lessons;
})();

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
  /** Trilha: o mesmo parâmetro que a sidebar controla. */
  track?: TrackSlug;
  instructor?: string;
  /** Intervalo de publicação, em `AAAA-MM-DD`. Os dois lados são opcionais. */
  from?: string;
  to?: string;
  order?: SortOrder;
};

/** Acima de 95% a aula conta como concluída: ninguém assiste os créditos. */
const COMPLETION_THRESHOLD = 0.95;

function normalize(text: string) {
  // Sem acentos: "estrategia" precisa encontrar "Estratégia".
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matches(lesson: Lesson, filter: LessonFilter) {
  if (filter.track && lesson.track.slug !== filter.track) return false;
  if (filter.instructor && lesson.instructor !== filter.instructor)
    return false;

  // Compara só a parte da data: o intervalo é inclusivo nas duas pontas, e
  // uma aula publicada às 14h do dia "até" não pode ficar de fora.
  const day = lesson.data.slice(0, 10);
  if (filter.from && day < filter.from) return false;
  if (filter.to && day > filter.to) return false;

  if (filter.search) {
    const term = normalize(filter.search);
    const target = normalize(
      `${lesson.title} ${lesson.instructor} ${lesson.track.name}`,
    );
    if (!target.includes(term)) return false;
  }

  return true;
}

const COMPARATORS: Record<SortOrder, (a: Lesson, b: Lesson) => number> = {
  recentes: (a, b) => b.data.localeCompare(a.data),
  antigas: (a, b) => a.data.localeCompare(b.data),
  populares: (a, b) => b.views - a.views,
  curtas: (a, b) => a.duration - b.duration,
  longas: (a, b) => b.duration - a.duration,
};

export type LessonsResult = {
  lessons: Array<Lesson>;
  /** Total de resultados do filtro, não do acervo. */
  total: number;
  /** Se existe página seguinte — é o que destrava a rolagem infinita. */
  hasMore: boolean;
};

/**
 * Uma página da listagem.
 *
 * A paginação é do servidor, e não um `slice` no cliente: o acervo tem 128
 * aulas hoje e não faz sentido baixá-lo inteiro para mostrar 12.
 */
export async function listLessons(
  filter: LessonFilter = {},
  page = 1,
): Promise<LessonsResult> {
  const result = CATALOG.filter((lesson) => matches(lesson, filter)).sort(
    COMPARATORS[filter.order ?? "recentes"],
  );

  const start = (Math.max(1, page) - 1) * PAGE_SIZE;
  const lessons = result.slice(start, start + PAGE_SIZE);

  return {
    lessons,
    total: result.length,
    hasMore: start + lessons.length < result.length,
  };
}

/**
 * A aula mais próxima de um assunto — usada para ligar um post do blog à
 * aula correspondente.
 *
 * Pontua por palavra do título em comum e dá um empurrão para a trilha de
 * mesmo slug da categoria do post. Sem nenhuma palavra em comum devolve
 * `null`: uma sugestão aleatória é pior do que nenhuma.
 */
export async function getSuggestedLesson(
  subject: string,
  trackSlug?: string,
): Promise<Lesson | null> {
  const words = normalize(subject)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3);

  if (words.length === 0 && !trackSlug) return null;

  let best: { lesson: Lesson; score: number } | null = null;

  for (const lesson of CATALOG) {
    const target = normalize(lesson.title);
    let score = words.filter((word) => target.includes(word)).length;

    if (trackSlug && lesson.track.slug === trackSlug) score += 1;

    if (score > 0 && (!best || score > best.score)) {
      best = { lesson, score };
    }
  }

  return best?.lesson ?? null;
}

/** O acervo inteiro. Serve às estatísticas do painel, não à listagem. */
export async function getCatalog(): Promise<Array<Lesson>> {
  return CATALOG;
}

/** Uma aula pelo slug; `null` quando não existe. */
export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  return CATALOG.find((lesson) => lesson.slug === slug) ?? null;
}

/** A aula mais recente ainda em andamento — o card fixo da sidebar. */
export async function getContinueWatching(): Promise<Lesson | null> {
  const inProgress = CATALOG.filter(
    (lesson) =>
      lesson.watched > 0 &&
      lesson.watched / lesson.duration < COMPLETION_THRESHOLD,
  ).sort(COMPARATORS.recentes);

  return inProgress[0] ?? null;
}

/** `1125` → `18:45`. */
export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

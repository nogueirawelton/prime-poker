/**
 * Acervo de aulas da área do jogador.
 *
 * O WordPress ainda não expõe um CPT de aulas, então o catálogo aqui é um
 * mock determinístico: mesma entrada, mesma saída em qualquer processo. Toda a
 * UI conversa só com `listarAulas` / `getContinuarAssistindo`, então trocar
 * este arquivo por consultas ao WPGraphQL (nos moldes de `services/blog.ts`)
 * não toca em nenhum componente.
 */

export type CategoriaSlug =
  | "estrategia"
  | "mental-game"
  | "torneios"
  | "analise-de-maos"
  | "fundamentos"
  | "ferramentas"
  | "profissional";

export type Categoria = {
  slug: CategoriaSlug;
  /** Nome completo, usado na sidebar. */
  nome: string;
  /** Nome curto para o selo sobre a capa. */
  selo: string;
  /** Classes do selo — cores fora da paleta base identificam a trilha. */
  cor: string;
  /** Gradiente da capa enquanto não há thumbnail real. */
  capa: string;
};

export const CATEGORIAS: Array<Categoria> = [
  {
    slug: "estrategia",
    nome: "Estratégia",
    selo: "Estratégia",
    cor: "bg-prime-red text-prime-light",
    capa: "from-prime-red/40 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "mental-game",
    nome: "Mental Game",
    selo: "Mental Game",
    cor: "bg-emerald-600 text-prime-light",
    capa: "from-emerald-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "torneios",
    nome: "Torneios",
    selo: "Torneios",
    cor: "bg-violet-600 text-prime-light",
    capa: "from-violet-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "analise-de-maos",
    nome: "Análise de Mãos",
    selo: "Análise",
    cor: "bg-orange-500 text-prime-dark",
    capa: "from-orange-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "fundamentos",
    nome: "Fundamentos",
    selo: "Fundamentos",
    cor: "bg-blue-600 text-prime-light",
    capa: "from-blue-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "ferramentas",
    nome: "Ferramentas",
    selo: "Ferramentas",
    cor: "bg-indigo-600 text-prime-light",
    capa: "from-indigo-500/35 via-prime-darkgray to-prime-dark",
  },
  {
    slug: "profissional",
    nome: "Profissional",
    selo: "Profissional",
    cor: "bg-amber-500 text-prime-dark",
    capa: "from-amber-500/35 via-prime-darkgray to-prime-dark",
  },
];

export const NIVEIS = ["iniciante", "intermediario", "avancado"] as const;
export type Nivel = (typeof NIVEIS)[number];

export const NIVEL_LABEL: Record<Nivel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const INSTRUTORES = [
  "Felipe Martins",
  "Carla Mendes",
  "Rafael Moraes",
  "Lucas Rocha",
] as const;

export type Aula = {
  id: string;
  slug: string;
  titulo: string;
  categoria: Categoria;
  instrutor: string;
  nivel: Nivel;
  /** Duração em segundos. */
  duracao: number;
  /** Segundos já assistidos pelo jogador. */
  assistido: number;
  /** Publicação, em ISO — a ordenação por data usa este campo. */
  data: string;
  visualizacoes: number;
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
function pseudoAleatorio(semente: number) {
  let estado = semente;

  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

const TITULOS: Record<CategoriaSlug, Array<string>> = {
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
const TOTAL_ACERVO = 128;

const ACERVO: Array<Aula> = (() => {
  const random = pseudoAleatorio(20260830);
  const agora = Date.UTC(2026, 7, 30);
  const aulas: Array<Aula> = [];

  for (let i = 0; i < TOTAL_ACERVO; i++) {
    const categoria = CATEGORIAS[i % CATEGORIAS.length];
    const titulos = TITULOS[categoria.slug];
    const titulo = titulos[Math.floor(random() * titulos.length)];
    const duracao = Math.floor(600 + random() * 1200);
    const progresso = random();

    aulas.push({
      id: `aula-${i + 1}`,
      slug: `${categoria.slug}-${i + 1}`,
      // O acervo real terá títulos únicos; aqui o índice evita repetição.
      titulo: i < titulos.length ? titulo : `${titulo} #${i + 1}`,
      categoria,
      instrutor: INSTRUTORES[Math.floor(random() * INSTRUTORES.length)],
      nivel: NIVEIS[Math.floor(random() * NIVEIS.length)],
      duracao,
      // Só parte do acervo tem progresso: a maioria nunca foi aberta.
      assistido: progresso > 0.75 ? Math.floor(duracao * (progresso - 0.7)) : 0,
      data: new Date(agora - i * 86400000 * 2).toISOString(),
      visualizacoes: Math.floor(random() * 4000),
    });
  }

  return aulas;
})();

/* -------------------------------------------------------------------------- */
/*                            Filtros e ordenação                             */
/* -------------------------------------------------------------------------- */

export const ORDENS = [
  "recentes",
  "antigas",
  "populares",
  "curtas",
  "longas",
] as const;
export type Ordem = (typeof ORDENS)[number];

export const ORDEM_LABEL: Record<Ordem, string> = {
  recentes: "Mais recentes",
  antigas: "Mais antigas",
  populares: "Mais assistidas",
  curtas: "Menor duração",
  longas: "Maior duração",
};

/** Estado completo da listagem — espelha os parâmetros da URL. */
export type FiltroAulas = {
  busca?: string;
  /** Trilha: o mesmo parâmetro que a sidebar controla. */
  categoria?: CategoriaSlug;
  instrutor?: string;
  /** Intervalo de publicação, em `AAAA-MM-DD`. Os dois lados são opcionais. */
  de?: string;
  ate?: string;
  ordem?: Ordem;
};

/** Acima de 95% a aula conta como concluída: ninguém assiste os créditos. */
const LIMIAR_CONCLUIDA = 0.95;

function normalizar(texto: string) {
  // Sem acentos: "estrategia" precisa encontrar "Estratégia".
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function combina(aula: Aula, filtro: FiltroAulas) {
  if (filtro.categoria && aula.categoria.slug !== filtro.categoria)
    return false;
  if (filtro.instrutor && aula.instrutor !== filtro.instrutor) return false;

  // Compara só a parte da data: o intervalo é inclusivo nas duas pontas, e
  // uma aula publicada às 14h do dia "até" não pode ficar de fora.
  const dia = aula.data.slice(0, 10);
  if (filtro.de && dia < filtro.de) return false;
  if (filtro.ate && dia > filtro.ate) return false;

  if (filtro.busca) {
    const termo = normalizar(filtro.busca);
    const alvo = normalizar(
      `${aula.titulo} ${aula.instrutor} ${aula.categoria.nome}`,
    );
    if (!alvo.includes(termo)) return false;
  }

  return true;
}

const COMPARADORES: Record<Ordem, (a: Aula, b: Aula) => number> = {
  recentes: (a, b) => b.data.localeCompare(a.data),
  antigas: (a, b) => a.data.localeCompare(b.data),
  populares: (a, b) => b.visualizacoes - a.visualizacoes,
  curtas: (a, b) => a.duracao - b.duracao,
  longas: (a, b) => b.duracao - a.duracao,
};

export type PaginaAulas = {
  aulas: Array<Aula>;
  /** Total de resultados do filtro, não do acervo. */
  total: number;
  /** Se existe página seguinte — é o que destrava a rolagem infinita. */
  temMais: boolean;
};

/**
 * Uma página da listagem.
 *
 * A paginação é do servidor, e não um `slice` no cliente: o acervo tem 128
 * aulas hoje e não faz sentido baixá-lo inteiro para mostrar 12.
 */
export async function listarAulas(
  filtro: FiltroAulas = {},
  pagina = 1,
): Promise<PaginaAulas> {
  const resultado = ACERVO.filter((aula) => combina(aula, filtro)).sort(
    COMPARADORES[filtro.ordem ?? "recentes"],
  );

  const inicio = (Math.max(1, pagina) - 1) * PAGE_SIZE;
  const aulas = resultado.slice(inicio, inicio + PAGE_SIZE);

  return {
    aulas,
    total: resultado.length,
    temMais: inicio + aulas.length < resultado.length,
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
export async function getAulaSugerida(
  assunto: string,
  categoriaSlug?: string,
): Promise<Aula | null> {
  const palavras = normalizar(assunto)
    .split(/[^a-z0-9]+/)
    .filter((palavra) => palavra.length > 3);

  if (palavras.length === 0 && !categoriaSlug) return null;

  let melhor: { aula: Aula; pontos: number } | null = null;

  for (const aula of ACERVO) {
    const alvo = normalizar(aula.titulo);
    let pontos = palavras.filter((palavra) => alvo.includes(palavra)).length;

    if (categoriaSlug && aula.categoria.slug === categoriaSlug) pontos += 1;

    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) {
      melhor = { aula, pontos };
    }
  }

  return melhor?.aula ?? null;
}

/** O acervo inteiro. Serve às estatísticas do painel, não à listagem. */
export async function getAcervo(): Promise<Array<Aula>> {
  return ACERVO;
}

/** Uma aula pelo slug; `null` quando não existe. */
export async function getAulaPorSlug(slug: string): Promise<Aula | null> {
  return ACERVO.find((aula) => aula.slug === slug) ?? null;
}

/** A aula mais recente ainda em andamento — o card fixo da sidebar. */
export async function getContinuarAssistindo(): Promise<Aula | null> {
  const emAndamento = ACERVO.filter(
    (aula) =>
      aula.assistido > 0 && aula.assistido / aula.duracao < LIMIAR_CONCLUIDA,
  ).sort(COMPARADORES.recentes);

  return emAndamento[0] ?? null;
}

/** `1125` → `18:45`. */
export function formatarDuracao(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);

  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

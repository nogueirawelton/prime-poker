/**
 * Dados mockados do blog.
 *
 * A forma imita o que o WPGraphQL devolve (`nodes`, `slug`, `isSticky`), para
 * que a troca pelo CMS seja só substituir a origem — sem mexer nos componentes.
 */
export type Category = {
  name: string;
  slug: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  date: string;
  readingTime: number;
  isSticky: boolean;
  content: Array<{ heading?: string; paragraphs: Array<string> }>;
};

export const CATEGORIES: Array<Category> = [
  { name: "Estratégia", slug: "estrategia" },
  { name: "Mindset", slug: "mindset" },
  { name: "Torneios", slug: "torneios" },
  { name: "Bankroll", slug: "bankroll" },
  { name: "Bastidores", slug: "bastidores" },
];

const bySlug = (slug: string) =>
  CATEGORIES.find((category) => category.slug === slug) as Category;

/** Quantos posts por página na listagem. */
export const PAGE_SIZE = 6;

const LOREM: Post["content"] = [
  {
    paragraphs: [
      "Todo jogador que sai do micro para o mid descobre a mesma coisa: o que funcionava antes vira vazamento. Os oponentes deixam de pagar demais e passam a punir cada desvio.",
      "Este texto é um placeholder do conteúdo que virá do WordPress. A estrutura já está pronta para receber blocos com título e parágrafos.",
    ],
  },
  {
    heading: "O que muda na prática",
    paragraphs: [
      "A primeira mudança é de ritmo. Você deixa de tomar decisões automáticas e passa a construir linhas com intenção — cada aposta responde a uma pergunta específica sobre o range do vilão.",
      "A segunda é de disciplina. Sessões mais longas exigem protocolo de parada, revisão de mãos e um plano de estudo que não dependa de motivação.",
    ],
  },
  {
    heading: "Por onde começar",
    paragraphs: [
      "Comece pelas situações que mais se repetem no seu volume. Não adianta estudar spots exóticos enquanto os pots de continuação simples ainda geram dúvida.",
      "Registre as mãos que geraram desconforto, agrupe por padrão e leve três delas para a revisão semanal com o coach.",
    ],
  },
];

export const POSTS: Array<Post> = [
  {
    id: "1",
    slug: "ranges-de-abertura-por-posicao",
    title: "Ranges de abertura por posição: o mapa que todo grinder precisa",
    excerpt:
      "Abrir mãos demais no early é o vazamento mais caro do jogador iniciante. Veja como montar ranges consistentes do UTG ao button.",
    category: bySlug("estrategia"),
    author: "Rafael Moraes",
    date: "2026-08-18",
    readingTime: 8,
    isSticky: true,
    content: LOREM,
  },
  {
    id: "2",
    slug: "tilt-o-inimigo-invisivel",
    title: "Tilt: o inimigo invisível do seu winrate",
    excerpt:
      "Reconhecer os gatilhos é metade do trabalho. A outra metade é ter um protocolo pronto para quando eles aparecerem.",
    category: bySlug("mindset"),
    author: "Camila Duarte",
    date: "2026-08-11",
    readingTime: 6,
    isSticky: true,
    content: LOREM,
  },
  {
    id: "3",
    slug: "gestao-de-banca-do-micro-ao-mid",
    title: "Gestão de banca: do micro ao mid sem quebrar no caminho",
    excerpt:
      "Subir de limite cedo demais destrói mais carreiras do que jogar mal. Os números que definem quando avançar.",
    category: bySlug("bankroll"),
    author: "Diego Antunes",
    date: "2026-08-04",
    readingTime: 10,
    isSticky: true,
    content: LOREM,
  },
  {
    id: "4",
    slug: "icm-na-mesa-final",
    title: "ICM na mesa final: quando foldar ases é matematicamente certo",
    excerpt:
      "A pressão do ICM muda tudo nas últimas posições pagas. Entenda por que a mão mais forte nem sempre é a jogada mais lucrativa.",
    category: bySlug("torneios"),
    author: "Rafael Moraes",
    date: "2026-07-28",
    readingTime: 12,
    isSticky: false,
    content: LOREM,
  },
  {
    id: "5",
    slug: "rotina-de-estudo-que-funciona",
    title: "A rotina de estudo que separa o amador do profissional",
    excerpt:
      "Não é sobre horas na mesa. É sobre o que você faz nas duas horas antes de sentar.",
    category: bySlug("mindset"),
    author: "Camila Duarte",
    date: "2026-07-21",
    readingTime: 7,
    isSticky: false,
    content: LOREM,
  },
  {
    id: "6",
    slug: "3bet-pots-fora-de-posicao",
    title: "3-bet pots fora de posição: sobrevivendo ao pior cenário",
    excerpt:
      "Jogar OOP em pote inflado é onde o EV evapora. Estruture o c-bet e escolha os boards certos para prosseguir.",
    category: bySlug("estrategia"),
    author: "Lucas Ferreira",
    date: "2026-07-14",
    readingTime: 9,
    isSticky: false,
    content: LOREM,
  },
  {
    id: "7",
    slug: "bastidores-do-primeiro-ano",
    title: "Bastidores: como foi o primeiro ano de um jogador do time",
    excerpt:
      "Do stake inicial ao primeiro high roller. O relato sem filtro de quem começou do zero na Prime.",
    category: bySlug("bastidores"),
    author: "Equipe Prime",
    date: "2026-07-07",
    readingTime: 5,
    isSticky: false,
    content: LOREM,
  },
  {
    id: "8",
    slug: "satelites-o-atalho-subestimado",
    title: "Satélites: o atalho subestimado para os grandes campos",
    excerpt:
      "Jogar satélite exige uma estratégia própria — e quem entende isso compra assento por uma fração do buy-in.",
    category: bySlug("torneios"),
    author: "Diego Antunes",
    date: "2026-06-30",
    readingTime: 6,
    isSticky: false,
    content: LOREM,
  },
  {
    id: "9",
    slug: "quando-parar-a-sessao",
    title: "Quando parar a sessão: os sinais que você costuma ignorar",
    excerpt:
      "Stop loss não é covardia, é gestão de risco. Defina o seu antes de sentar, nunca durante.",
    category: bySlug("bankroll"),
    author: "Lucas Ferreira",
    date: "2026-06-23",
    readingTime: 4,
    isSticky: false,
    content: LOREM,
  },
];

export const STICKY_POSTS = POSTS.filter((post) => post.isSticky);

/** Posts em ordem cronológica decrescente, sem os destaques duplicados. */
export const ALL_POSTS = [...POSTS].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export const TOTAL_PAGES = Math.max(1, Math.ceil(ALL_POSTS.length / PAGE_SIZE));

export function getPage(page: number) {
  const start = (page - 1) * PAGE_SIZE;
  return ALL_POSTS.slice(start, start + PAGE_SIZE);
}

export function getPost(slug: string) {
  return ALL_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getByCategory(categorySlug: string) {
  return ALL_POSTS.filter((post) => post.category.slug === categorySlug);
}

/** Mesma categoria primeiro; completa com os mais recentes se faltar. */
export function getRelated(post: Post, limit = 3) {
  const sameCategory = ALL_POSTS.filter(
    (item) => item.id !== post.id && item.category.slug === post.category.slug,
  );

  const rest = ALL_POSTS.filter(
    (item) => item.id !== post.id && item.category.slug !== post.category.slug,
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

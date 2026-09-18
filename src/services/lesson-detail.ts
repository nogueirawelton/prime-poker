import "server-only";

import {
  getCatalog,
  getLessonBySlug,
  type Lesson,
  listLessons,
} from "./lessons";

/**
 * Conteúdo e estado da aula aberta.
 *
 * Separado de `aulas.ts` porque aqui há estado mutável (salvos, concluídos,
 * dúvidas) — e `aulas.ts` é importado por componentes cliente, que levariam
 * uma cópia divergente desse estado para cada aba.
 *
 * Continua mock: o WordPress ainda não expõe aulas. Ao ligar no CMS, só as
 * funções deste arquivo mudam.
 */

export type Material = {
  name: string;
  /** Já formatado para exibição, como vem da media library. */
  size: string;
  /** Ausente enquanto o arquivo não existe no CMS: o botão fica desabilitado. */
  url?: string;
};

export type Question = {
  id: string;
  author: string;
  /** Instrutor e aluno são apresentados de formas diferentes na conversa. */
  isInstructor: boolean;
  text: string;
  data: string;
};

export type LessonDetail = Lesson & {
  /** HTML do editor — renderizado com a classe `rich-text` do projeto. */
  description: string;
  materials: Array<Material>;
  questions: Array<Question>;
  saved: boolean;
  completed: boolean;
};

/* -------------------------------------------------------------------------- */
/*                          Estado do jogador (mock)                          */
/* -------------------------------------------------------------------------- */

const SAVED = new Set<string>();
const COMPLETED = new Set<string>();
const QUESTIONS = new Map<string, Array<Question>>();

/* -------------------------------------------------------------------------- */
/*                                  Conteúdo                                  */
/* -------------------------------------------------------------------------- */

function descriptionFor(lesson: Lesson) {
  return `
    <p>Nesta aula vamos explorar ${lesson.title.toLowerCase()} na prática, com
    exemplos de mãos reais e os erros que mais custam fichas.</p>
    <h3>Tópicos abordados</h3>
    <ul>
      <li>O conceito e por que ele importa</li>
      <li>Como identificar a situação na mesa</li>
      <li>Aplicando a linha na prática</li>
      <li>Exemplos comentados</li>
      <li>Erros comuns</li>
    </ul>
    <h3>Links úteis</h3>
    <ul>
      <li><a href="/blog">Artigo relacionado no blog</a></li>
      <li><a href="/player/aulas?cat=${lesson.track.slug}">Outras aulas da trilha</a></li>
    </ul>
  `;
}

const MATERIALS: Array<Material> = [
  { name: "slides_da_aula.pdf", size: "2.4 MB" },
  { name: "exemplos_praticos.xlsx", size: "1.1 MB" },
  { name: "resumo_aula.txt", size: "0.5 MB" },
  { name: "ranges.png", size: "0.8 MB" },
];

/** Conversa de exemplo, para a aba não abrir vazia em toda aula. */
function initialQuestions(lesson: Lesson): Array<Question> {
  const base = new Date(lesson.data).getTime();

  return [
    {
      id: `${lesson.id}-d1`,
      author: "Você",
      isInstructor: false,
      text: "No flop Q♦ 7♥ 2♦, em que situações devo c-betar com meu range polarizado?",
      data: new Date(base + 3600000).toISOString(),
    },
    {
      id: `${lesson.id}-d2`,
      author: lesson.instructor,
      isInstructor: true,
      text: "Prioriza c-bet polarizada quando você tem vantagem de nut e o board favorece seu range de 3-bet. Em Q72 rainbow, a frequência sobe bastante.",
      data: new Date(base + 5400000).toISOString(),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*                                  Leitura                                   */
/* -------------------------------------------------------------------------- */

/** `null` quando o slug não existe — a página responde 404. */
export async function getLesson(slug: string): Promise<LessonDetail | null> {
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return null;

  return {
    ...lesson,
    description: descriptionFor(lesson),
    materials: MATERIALS,
    questions: QUESTIONS.get(slug) ?? initialQuestions(lesson),
    saved: SAVED.has(slug),
    completed: COMPLETED.has(slug),
  };
}

/** Slugs marcados como concluídos pelo jogador. */
export async function getCompletedSlugs(): Promise<Set<string>> {
  return new Set(COMPLETED);
}

/** As aulas que o jogador salvou, da mais recente para a mais antiga. */
export async function getSavedLessons(): Promise<Array<Lesson>> {
  const catalog = await getCatalog();

  return catalog
    .filter((lesson) => SAVED.has(lesson.slug))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** Próximas aulas da mesma trilha, para continuar a sequência. */
export async function getNextLessons(
  lesson: Lesson,
  limit = 4,
): Promise<Array<Lesson>> {
  const { lessons } = await listLessons({ track: lesson.track.slug });

  return lessons.filter((item) => item.slug !== lesson.slug).slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/*                                  Escrita                                   */
/* -------------------------------------------------------------------------- */

export async function toggleSaved(slug: string) {
  if (SAVED.has(slug)) {
    SAVED.delete(slug);
  } else {
    SAVED.add(slug);
  }
}

export async function toggleCompleted(slug: string) {
  if (COMPLETED.has(slug)) {
    COMPLETED.delete(slug);
  } else {
    COMPLETED.add(slug);
  }
}

/** Registra a pergunta do jogador. A resposta do instrutor vem por fora. */
export async function addQuestion(slug: string, text: string) {
  const lesson = await getLesson(slug);
  if (!lesson) return;

  const currentItems = QUESTIONS.get(slug) ?? initialQuestions(lesson);

  QUESTIONS.set(slug, [
    ...currentItems,
    {
      id: `${slug}-${Date.now()}`,
      author: "Você",
      isInstructor: false,
      text,
      data: new Date().toISOString(),
    },
  ]);
}

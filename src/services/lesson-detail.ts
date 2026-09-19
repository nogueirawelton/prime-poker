import "server-only";

import { authMutate } from "@/graphql/auth-client";
import { REGISTER_LESSON_VIEW } from "@/graphql/mutations/player/REGISTER_LESSON_VIEW";
import type { Lesson } from "@/lib/lessons";
import { getCatalog, getLessonNode, listLessons, toLesson } from "./lessons";

/**
 * Conteúdo e estado da aula aberta.
 *
 * Separado de `lessons.ts` porque aqui há estado do jogador (salvas,
 * concluídas, dúvidas).
 *
 * A aula, a descrição, o vídeo e os materiais vêm do WordPress. Salvas e
 * concluídas continuam em memória até a etapa 8, e as dúvidas até a etapa 9:
 * só as funções deste arquivo mudam quando forem para o CMS.
 */

export type Material = {
  name: string;
  /** Já formatado para exibição (`2,4 MB`); vazio quando desconhecido. */
  size: string;
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
  /**
   * Link assinado do player (Bunny), válido por algumas horas. `null` sem
   * acesso, sem vídeo cadastrado ou com o Bunny fora de configuração.
   */
  video: string | null;
  /** `null` para quem não pode assistir: o WordPress nem os envia. */
  materials: Array<Material> | null;
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

const sizeFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** `2400000` → `2,3 MB`. */
function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${sizeFormatter.format(bytes / 1024)} KB`;

  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`;
}

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
  const node = await getLessonNode(slug);
  if (!node) return null;

  const lesson = toLesson(node);

  return {
    ...lesson,
    description: node.content ?? "",
    video: node.video?.url ?? null,
    materials:
      node.materials?.map((material) => ({
        name: material.name,
        size: formatSize(material.fileSize),
        url: material.url,
      })) ?? null,
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
  if (!lesson.track) return [];

  const { lessons } = await listLessons({ track: lesson.track.slug });

  return lessons.filter((item) => item.slug !== lesson.slug).slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/*                                  Escrita                                   */
/* -------------------------------------------------------------------------- */

/**
 * Conta a visualização da aula. O plugin ignora a repetição do mesmo jogador
 * em 12 horas, então recarregar a página não infla o número.
 */
export async function registerView(lessonId: number) {
  await authMutate(REGISTER_LESSON_VIEW, { lessonId });
}

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

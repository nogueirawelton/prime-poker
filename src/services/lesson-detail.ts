import "server-only";

import { authMutate } from "@/graphql/auth-client";
import { ASK_LESSON_QUESTION } from "@/graphql/mutations/player/ASK_LESSON_QUESTION";
import { REGISTER_LESSON_PROGRESS } from "@/graphql/mutations/player/REGISTER_LESSON_PROGRESS";
import { REGISTER_LESSON_VIEW } from "@/graphql/mutations/player/REGISTER_LESSON_VIEW";
import { TOGGLE_LESSON_COMPLETED } from "@/graphql/mutations/player/TOGGLE_LESSON_COMPLETED";
import { TOGGLE_LESSON_SAVED } from "@/graphql/mutations/player/TOGGLE_LESSON_SAVED";
import { TOGGLE_QUESTION_LIKE } from "@/graphql/mutations/player/TOGGLE_QUESTION_LIKE";
import type { Lesson } from "@/lib/lessons";
import { getCatalog, getLessonNode, listLessons, toLesson } from "./lessons";

/**
 * Conteúdo e estado da aula aberta.
 *
 * Separado de `lessons.ts` porque aqui há estado do jogador: progresso,
 * salvas, concluídas e dúvidas.
 *
 * Tudo vem do WordPress. As dúvidas são comentários do CPT aula: o plugin
 * as fecha para a área do jogador e devolve o texto puro, o nome a exibir e
 * se a resposta é do instrutor.
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
  /**
   * Foto de quem escreveu; `null` cai nas iniciais do nome.
   *
   * Na resposta da equipe é a imagem destacada do instrutor da aula, e não a
   * de quem digitou — a resposta sai em nome dele, como o nome exibido.
   */
  avatarUrl: string | null;
  /** Instrutor e aluno são apresentados de formas diferentes na conversa. */
  isInstructor: boolean;
  text: string;
  data: string;
  /** Respostas penduradas nesta pergunta, da mais antiga para a mais nova. */
  replies: Array<Question>;
  /** Foi o jogador logado que escreveu? */
  isMine: boolean;
  /** Quantas curtidas. */
  likes: number;
  /** O jogador logado marcou esta? */
  liked: boolean;
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
};

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
    questions: toThreads(node.comments?.nodes ?? []),
  };
}

/**
 * Comentários soltos → perguntas com as respostas penduradas.
 *
 * O WordPress guarda a conversa como uma lista plana com o ID do pai; quem
 * responde pelo painel usa o **Responder**, e é esse elo que a tela usa para
 * mostrar a resposta embaixo da pergunta certa.
 *
 * Resposta cuja pergunta sumiu (apagada no painel) sobe para o primeiro
 * nível em vez de desaparecer junto — é conteúdo que alguém escreveu.
 */
function toThreads(
  nodes: Array<{
    databaseId: number;
    parentDatabaseId: number;
    date: string;
    text: string;
    authorLabel: string;
    authorAvatar: string | null;
    isInstructor: boolean;
    isMine: boolean;
    likeCount: number;
    liked: boolean;
  }>,
): Array<Question> {
  const byId = new Map<number, Question>(
    nodes.map((comment) => [
      comment.databaseId,
      {
        id: String(comment.databaseId),
        author: comment.authorLabel,
        avatarUrl: comment.authorAvatar,
        isInstructor: comment.isInstructor,
        text: comment.text,
        data: comment.date,
        replies: [],
        isMine: comment.isMine,
        likes: comment.likeCount,
        liked: comment.liked,
      },
    ]),
  );

  const parentOf = new Map(
    nodes.map((comment) => [comment.databaseId, comment.parentDatabaseId]),
  );

  /**
   * A pergunta que abriu a conversa deste comentário.
   *
   * Sobe pela corrente de pais até achar quem não tem pai na lista. O painel
   * do WordPress aceita responder uma resposta, e a tela mostra tudo num
   * nível só: o que importa ao jogador é a pergunta a que aquilo responde.
   */
  function rootOf(id: number): number {
    const seen = new Set<number>();
    let current = id;

    while (!seen.has(current)) {
      seen.add(current);

      const parent = parentOf.get(current) ?? 0;
      if (!byId.has(parent)) return current;

      current = parent;
    }

    return current;
  }

  const threads: Array<Question> = [];

  for (const comment of nodes) {
    const question = byId.get(comment.databaseId);
    if (!question) continue;

    const root = rootOf(comment.databaseId);

    if (root === comment.databaseId) {
      threads.push(question);
    } else {
      byId.get(root)?.replies.push(question);
    }
  }

  return threads;
}

/** As aulas que o jogador salvou, da mais recente para a mais antiga. */
export async function getSavedLessons(): Promise<Array<Lesson>> {
  const catalog = await getCatalog();

  return catalog
    .filter((lesson) => lesson.saved)
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

/** Salva a aula na lista do jogador, ou a tira de lá. */
export async function toggleSaved(lessonId: number): Promise<boolean> {
  const data = await authMutate<{
    toggleLessonSaved: { saved: boolean } | null;
  }>(TOGGLE_LESSON_SAVED, { lessonId });

  return data.toggleLessonSaved?.saved ?? false;
}

/** Marca ou desmarca a aula como concluída. */
export async function toggleCompleted(lessonId: number): Promise<boolean> {
  const data = await authMutate<{
    toggleLessonCompleted: { completed: boolean } | null;
  }>(TOGGLE_LESSON_COMPLETED, { lessonId });

  return data.toggleLessonCompleted?.completed ?? false;
}

/**
 * Guarda onde o jogador parou.
 *
 * O plugin conclui a aula sozinho ao passar de 90%, e é por isso que o
 * retorno diz se ela ficou concluída: o card muda sem recarregar a página.
 */
export async function saveProgress(
  lessonId: number,
  seconds: number,
): Promise<{ watched: number; completed: boolean }> {
  const data = await authMutate<{
    registerLessonProgress: {
      watchedSeconds: number | null;
      completed: boolean | null;
    } | null;
  }>(REGISTER_LESSON_PROGRESS, { lessonId, seconds });

  return {
    watched: data.registerLessonProgress?.watchedSeconds ?? seconds,
    completed: data.registerLessonProgress?.completed ?? false,
  };
}

/**
 * Registra a pergunta do jogador.
 *
 * Vira um comentário aprovado na aula; a resposta vem pelo painel do
 * WordPress, em nome do instrutor.
 */
export async function addQuestion(
  lessonId: number,
  text: string,
  parentId?: number,
) {
  await authMutate(ASK_LESSON_QUESTION, { lessonId, text, parentId });
}

/** Curte ou descurte uma dúvida ou resposta; devolve o estado gravado. */
export async function toggleQuestionLike(
  commentId: number,
): Promise<{ liked: boolean; likes: number } | null> {
  const data = await authMutate<{
    toggleQuestionLike: { liked: boolean; likeCount: number } | null;
  }>(TOGGLE_QUESTION_LIKE, { commentId });

  if (!data.toggleQuestionLike) return null;

  return {
    liked: data.toggleQuestionLike.liked,
    likes: data.toggleQuestionLike.likeCount,
  };
}

"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  addQuestion,
  registerView,
  saveProgress,
  toggleCompleted,
  toggleQuestionLike,
  toggleSaved,
} from "@/services/lesson-detail";

/**
 * Server Actions são endpoints públicos: o guard do layout não protege estas
 * chamadas, então cada uma confere a sessão por conta própria.
 */
async function ensureSession() {
  const session = await getSession();
  if (!session) redirect("/login");
}

/**
 * Resposta das ações de clique.
 *
 * A tela já mudou antes de a action rodar (ver `useInstantToggle`): ela
 * precisa saber o estado que ficou gravado, para acertar o botão, ou o
 * motivo da falha, para desfazer e avisar. Por isso a falha volta como
 * valor, e não como exceção — uma exceção derrubaria a página no error
 * boundary por causa de um clique.
 */
export type ToggleResult = { value: boolean } | { error: string };

/**
 * Salva a aula na lista do jogador, ou a tira de lá.
 *
 * O `refresh()` continua aqui para o resto da tela acompanhar — a lista de
 * salvas, os contadores do painel. O botão clicado não depende dele.
 */
export async function saveLesson(lessonId: number): Promise<ToggleResult> {
  await ensureSession();

  try {
    const saved = await toggleSaved(lessonId);

    refresh();

    return { value: saved };
  } catch (error) {
    console.error("Falha ao salvar a aula", lessonId, error);

    return { error: "Não foi possível salvar a aula. Tente de novo." };
  }
}

/** Marca ou desmarca a aula como concluída. */
export async function completeLesson(lessonId: number): Promise<ToggleResult> {
  await ensureSession();

  try {
    const completed = await toggleCompleted(lessonId);

    refresh();

    return { value: completed };
  } catch (error) {
    console.error("Falha ao concluir a aula", lessonId, error);

    return { error: "Não foi possível atualizar a aula. Tente de novo." };
  }
}

/**
 * Guarda onde o jogador parou no vídeo.
 *
 * Chamada de tempos em tempos pelo player, então NÃO chama `refresh()`:
 * recarregar a página a cada quinze segundos atrapalharia justamente quem
 * está assistindo. A tela só reflete o progresso na próxima navegação.
 *
 * Falha aqui não é problema de quem assiste — no pior caso ele retoma de um
 * ponto um pouco anterior.
 */
export async function registerLessonProgress(
  lessonId: number,
  seconds: number,
) {
  await ensureSession();

  if (!Number.isInteger(lessonId) || lessonId <= 0) return;
  if (!Number.isFinite(seconds) || seconds < 0) return;

  try {
    await saveProgress(lessonId, Math.floor(seconds));
  } catch (error) {
    console.error("Falha ao guardar o progresso da aula", lessonId, error);
  }
}

/**
 * Conta a visualização ao abrir a aula.
 *
 * Chamada pelo navegador depois de a página montar, e não durante a
 * renderização: o prefetch de links renderiza páginas que ninguém abriu, e
 * cada uma contaria como vista. Falha aqui não é problema de quem assiste —
 * só se perde uma contagem.
 */
export async function registerLessonView(lessonId: number) {
  await ensureSession();

  if (!Number.isInteger(lessonId) || lessonId <= 0) return;

  try {
    await registerView(lessonId);
  } catch (error) {
    console.error("Falha ao contar visualização da aula", lessonId, error);
  }
}

export type QuestionState = { error?: string };

/**
 * Envia a dúvida do jogador ao instrutor da aula.
 *
 * Com `parentId`, entra como resposta dentro daquela conversa; sem ele, abre
 * uma dúvida nova.
 *
 * Recebe o texto, e não um `FormData`: o formulário já se limpou e a
 * mensagem já está na conversa quando isto roda (ver `QuestionsProvider`).
 */
export async function sendQuestion(
  lessonId: number,
  parentId: number | undefined,
  rawText: string,
): Promise<QuestionState> {
  await ensureSession();

  const text = String(rawText ?? "").trim();

  // Validação no servidor: a do cliente é conveniência, não garantia. O
  // plugin confere de novo — quem publica a dúvida é ele.
  if (!text) return { error: "Escreva sua dúvida antes de enviar." };
  if (text.length > 2000) {
    return { error: "Dúvida muito longa: use no máximo 2000 caracteres." };
  }

  try {
    await addQuestion(lessonId, text, parentId);
  } catch (error) {
    console.error("Falha ao enviar a dúvida da aula", lessonId, error);

    return { error: "Não foi possível enviar sua dúvida. Tente de novo." };
  }

  refresh();

  return {};
}

export type LikeResult = { liked: boolean; likes: number } | { error: string };

/** Curte ou descurte uma dúvida ou resposta. */
export async function likeQuestion(commentId: number): Promise<LikeResult> {
  await ensureSession();

  if (!Number.isInteger(commentId) || commentId <= 0) {
    return { error: "Mensagem inválida." };
  }

  try {
    const result = await toggleQuestionLike(commentId);

    if (!result) throw new Error("toggleQuestionLike sem retorno");

    refresh();

    return result;
  } catch (error) {
    console.error("Falha ao marcar a dúvida", commentId, error);

    return { error: "Não foi possível curtir. Tente de novo." };
  }
}

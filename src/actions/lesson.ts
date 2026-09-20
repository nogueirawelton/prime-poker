"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  addQuestion,
  registerView,
  saveProgress,
  toggleCompleted,
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
 * Salva a aula na lista do jogador, ou a tira de lá.
 *
 * Não devolve o novo estado: quem pinta o botão é a página recarregada pelo
 * `refresh()`, e assim a action serve tanto ao botão da aula quanto ao menu
 * do card, que não têm como guardar estado próprio.
 */
export async function saveLesson(lessonId: number) {
  await ensureSession();

  await toggleSaved(lessonId);

  // Sem o `refresh`, o botão continuaria mostrando o estado anterior até a
  // próxima navegação.
  refresh();
}

/** Marca ou desmarca a aula como concluída. */
export async function completeLesson(lessonId: number) {
  await ensureSession();

  await toggleCompleted(lessonId);

  refresh();
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

/** Envia a dúvida do jogador ao instrutor da aula. */
export async function sendQuestion(
  slug: string,
  _state: QuestionState,
  formData: FormData,
): Promise<QuestionState> {
  await ensureSession();

  const text = String(formData.get("text") ?? "").trim();

  // Validação mínima e no servidor: o cliente só desabilita o botão, e isso
  // é conveniência, não garantia.
  if (!text) return { error: "Escreva sua dúvida antes de enviar." };
  if (text.length > 2000) {
    return { error: "Dúvida muito longa: use no máximo 2000 caracteres." };
  }

  await addQuestion(slug, text);

  refresh();

  return {};
}

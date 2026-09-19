"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  addQuestion,
  registerView,
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

export async function saveLesson(slug: string) {
  await ensureSession();

  await toggleSaved(slug);

  // Sem o `refresh`, o botão continuaria mostrando o estado anterior até a
  // próxima navegação.
  refresh();
}

export async function completeLesson(slug: string) {
  await ensureSession();

  await toggleCompleted(slug);

  refresh();
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

"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  addQuestion,
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

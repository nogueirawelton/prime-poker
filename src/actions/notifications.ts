"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { markAllAsRead, markAsRead } from "@/services/notifications";

/**
 * Server Actions são endpoints públicos: o guard do layout não protege estas
 * chamadas, então cada uma confere a sessão por conta própria.
 */
async function ensureSession() {
  const session = await getSession();
  if (!session) redirect("/login");
}

/** Falha volta como valor: a tela já mudou e só precisa saber se desfaz. */
export type NotificationResult = { error?: string };

/** Alterna o estado de leitura de uma notificação. */
export async function toggleReadState(
  id: string,
  read: boolean,
): Promise<NotificationResult> {
  await ensureSession();

  try {
    await markAsRead(id, read);
  } catch (error) {
    console.error("Falha ao marcar a notificação", id, error);

    return { error: "Não foi possível atualizar a notificação." };
  }

  // Sem o `refresh`, o selo do sino e a lista voltariam ao estado anterior
  // assim que a mudança otimista expirasse.
  refresh();

  return {};
}

export async function markAllRead(): Promise<NotificationResult> {
  await ensureSession();

  try {
    await markAllAsRead();
  } catch (error) {
    console.error("Falha ao marcar todas as notificações", error);

    return { error: "Não foi possível marcar as notificações como lidas." };
  }

  refresh();

  return {};
}

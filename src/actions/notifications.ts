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

/** Alterna o estado de leitura de uma notificação. */
export async function toggleReadState(id: string, read: boolean) {
  await ensureSession();

  await markAsRead(id, read);

  // Sem o `refresh`, o selo do sino e a lista continuariam mostrando o estado
  // anterior até a próxima navegação.
  refresh();
}

export async function markAllRead() {
  await ensureSession();

  await markAllAsRead();

  refresh();
}

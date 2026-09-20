import "server-only";

import { authMutate, authQuery } from "@/graphql/auth-client";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION,
} from "@/graphql/mutations/player/MARK_NOTIFICATION";
import {
  NOTIFICATIONS,
  NOTIFICATIONS_UNREAD,
} from "@/graphql/queries/player/NOTIFICATIONS";

/**
 * Notificações do jogador, vindas do WordPress (módulo `Notifications`).
 *
 * Tudo aqui é por jogador — quem recebe cada aviso e o que já foi lido —,
 * então vai pelo `authQuery`, sem cache.
 *
 * `server-only` porque o cliente autenticado não pode ir para o navegador.
 */

/**
 * `aviso` é o comunicado do time — o antigo mural. Não existe página separada
 * para ele: tudo o que o time anuncia chega como notificação.
 *
 * `aula` e `suporte` o site cria sozinho, ao publicar uma aula e ao responder
 * uma dúvida.
 */
export type NotificationType = "aula" | "aviso" | "suporte";

export type PlayerNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** ISO. */
  data: string;
  read: boolean;
  /**
   * Para onde a notificação leva ao ser aberta.
   *
   * Opcional: um comunicado do time se esgota no próprio texto e não tem
   * destino — virar link para a lista onde ele já está seria um clique que
   * não leva a lugar nenhum.
   */
  href?: string;
};

export const FILTERS = ["todas", "nao-lidas", "lidas"] as const;
export type NotificationFilter = (typeof FILTERS)[number];

export const FILTER_LABEL: Record<NotificationFilter, string> = {
  todas: "Todas",
  "nao-lidas": "Não lidas",
  lidas: "Lidas",
};

/** Filtros da URL → `NotificationFilterEnum` do plugin. */
const ENUM: Record<NotificationFilter, string> = {
  todas: "ALL",
  "nao-lidas": "UNREAD",
  lidas: "READ",
};

const TYPES: Array<NotificationType> = ["aula", "aviso", "suporte"];

type NotificationNode = {
  id: number;
  type: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  href: string | null;
};

function toNotification(node: NotificationNode): PlayerNotification {
  const type = TYPES.find((known) => known === node.type) ?? "aviso";

  return {
    id: String(node.id),
    type,
    title: node.title,
    description: node.description,
    data: node.date,
    read: node.read,
    href: node.href ?? undefined,
  };
}

/** Da mais recente para a mais antiga; `limit` corta o topo da lista. */
export async function listNotifications(
  filter: NotificationFilter = "todas",
  limit?: number,
): Promise<Array<PlayerNotification>> {
  const data = await authQuery<{
    myNotifications: Array<NotificationNode> | null;
  }>(NOTIFICATIONS, { filter: ENUM[filter], first: limit });

  return (data.myNotifications ?? []).map(toNotification);
}

export async function countUnread(): Promise<number> {
  const data = await authQuery<{ notificationsUnread: number | null }>(
    NOTIFICATIONS_UNREAD,
  );

  return data.notificationsUnread ?? 0;
}

export async function markAsRead(id: string, read: boolean) {
  await authMutate(MARK_NOTIFICATION, {
    notificationId: Number(id),
    read,
  });
}

export async function markAllAsRead() {
  await authMutate(MARK_ALL_NOTIFICATIONS_READ);
}

"use client";

import { createContext, use, useOptimistic, useTransition } from "react";
import { toast } from "react-toastify";
import { markAllRead, toggleReadState } from "@/actions/notifications";
import type { PlayerNotification } from "@/services/notifications";

/**
 * Leituras marcadas que o servidor ainda não confirmou.
 *
 * `was` guarda o estado que veio do servidor: é o que permite corrigir o
 * selo do sino sem saber quais notificações ele contou.
 */
type Changes = {
  all: boolean;
  read: Record<string, { read: boolean; was: boolean }>;
};

type Change =
  | { kind: "one"; id: string; read: boolean; was: boolean }
  | { kind: "all" };

const EMPTY: Changes = { all: false, read: {} };

function reduce(current: Changes, change: Change): Changes {
  if (change.kind === "all") return { ...current, all: true };

  return {
    ...current,
    read: {
      ...current.read,
      [change.id]: { read: change.read, was: change.was },
    },
  };
}

const NotificationsContext = createContext<{
  isRead: (notification: PlayerNotification) => boolean;
  unread: (serverCount: number) => number;
  toggle: (notification: PlayerNotification) => void;
  markAll: () => void;
} | null>(null);

/**
 * Leitura de notificações sem espera, igual no sino e na página.
 *
 * O sino (no header) e a página são componentes separados: sem um estado em
 * comum, marcar uma como lida na página deixaria o selo contando até o
 * servidor responder. As mudanças ficam aqui como otimistas — valem enquanto
 * a action roda e expiram quando ela termina, que é quando o `refresh()`
 * dela já trouxe a lista e o selo de verdade. Se ela falha, expiram do mesmo
 * jeito, a tela volta ao que era e um toast avisa.
 */
export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [changes, apply] = useOptimistic(EMPTY, reduce);
  const [, startTransition] = useTransition();

  function isRead(notification: PlayerNotification) {
    if (changes.all) return true;

    return changes.read[notification.id]?.read ?? notification.read;
  }

  function unread(serverCount: number) {
    if (changes.all) return 0;

    let count = serverCount;

    for (const { read, was } of Object.values(changes.read)) {
      if (was && !read) count += 1;
      if (!was && read) count -= 1;
    }

    return Math.max(0, count);
  }

  function toggle(notification: PlayerNotification) {
    const read = !isRead(notification);

    startTransition(async () => {
      apply({
        kind: "one",
        id: notification.id,
        read,
        was: notification.read,
      });

      const result = await toggleReadState(notification.id, read);

      if (result.error) toast.error(result.error);
    });
  }

  function markAll() {
    startTransition(async () => {
      apply({ kind: "all" });

      const result = await markAllRead();

      if (result.error) toast.error(result.error);
    });
  }

  return (
    <NotificationsContext value={{ isRead, unread, toggle, markAll }}>
      {children}
    </NotificationsContext>
  );
}

export function useNotifications() {
  const context = use(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications precisa estar dentro de NotificationsProvider",
    );
  }

  return context;
}

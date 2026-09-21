"use client";

import { ChecksIcon } from "@phosphor-icons/react";
import { useNotifications } from "@/components/shared/player/notifications-provider";

/**
 * "Marcar todas como lidas" da página.
 *
 * Some no clique, junto com os pontos da lista e o selo do sino: tudo sai do
 * mesmo `NotificationsProvider`.
 */
export function MarkAllButton({ unreadCount }: { unreadCount: number }) {
  const { unread, markAll } = useNotifications();

  if (unread(unreadCount) === 0) return null;

  return (
    <button
      type="button"
      onClick={markAll}
      className="flex h-10 items-center gap-2 rounded-md border border-white/20 px-4 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
    >
      <ChecksIcon className="size-4" weight="bold" />
      Marcar todas como lidas
    </button>
  );
}

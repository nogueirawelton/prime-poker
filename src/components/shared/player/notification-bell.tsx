"use client";

import { ArrowRightIcon, BellIcon, ChecksIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Popover } from "radix-ui";
import { useState, useTransition } from "react";
import { markAllRead } from "@/actions/notifications";
import type { PlayerNotification } from "@/services/notifications";
import { NotificationItem } from "./notification-item";

/**
 * Sino de notificações com painel flutuante.
 *
 * As notificações vêm prontas do servidor (o header as busca), então abrir o
 * painel não dispara requisição: é só mostrar o que já está em memória. Como
 * as actions chamam `refresh()`, marcar algo como lido atualiza o selo e a
 * lista sem recarregar a página.
 */
export function NotificationBell({
  notifications,
  unreadCount,
}: {
  /** As mais recentes; a lista completa fica na página de notificações. */
  notifications: Array<PlayerNotification>;
  unreadCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        aria-label={
          unreadCount > 0
            ? `Notificações, ${unreadCount} não lidas`
            : "Notificações"
        }
        className="relative flex size-10 items-center justify-center rounded-lg text-prime-light/70 transition-colors duration-500 hover:bg-white/5 hover:text-prime-light data-[state=open]:bg-white/5 data-[state=open]:text-prime-light"
      >
        <BellIcon className="size-6" aria-hidden="true" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-prime-red font-bold text-[10px] text-prime-light"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 flex w-[22rem] flex-col rounded-xl border border-white/10 bg-prime-darkgray shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
        >
          <header className="flex items-center justify-between gap-3 border-white/10 border-b px-4 py-3">
            <strong className="font-bold text-prime-light text-sm uppercase">
              Notificações
            </strong>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => markAllRead())}
                className="flex items-center gap-1.5 text-prime-light/60 text-xs transition-colors duration-300 hover:text-prime-light disabled:opacity-50"
              >
                <ChecksIcon className="size-4" weight="bold" />
                Ler tudo
              </button>
            )}
          </header>

          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-prime-light/50 text-sm">
              Nenhuma notificação por aqui.
            </p>
          ) : (
            // Teto de altura: o painel rola por dentro em vez de crescer até
            // sair da tela.
            <div className="flex max-h-96 flex-col gap-1 overflow-y-auto p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}

          <footer className="border-white/10 border-t p-2">
            <Link
              href="/player/notificacoes"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-300 hover:bg-white/5 hover:text-prime-red"
            >
              Ver todas
              <ArrowRightIcon className="size-4" weight="bold" />
            </Link>
          </footer>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

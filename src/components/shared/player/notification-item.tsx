"use client";

import {
  ChatCircleIcon,
  CheckIcon,
  type Icon,
  MegaphoneIcon,
  PlayCircleIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { toggleReadState } from "@/actions/notifications";
import type {
  NotificationType,
  PlayerNotification,
} from "@/services/notifications";

const ICONS: Record<NotificationType, Icon> = {
  aula: PlayCircleIcon,
  aviso: MegaphoneIcon,
  conquista: TrophyIcon,
  suporte: ChatCircleIcon,
};

const COLORS: Record<NotificationType, string> = {
  aula: "bg-prime-red/15 text-prime-red",
  aviso: "bg-blue-500/15 text-blue-400",
  conquista: "bg-amber-500/15 text-amber-400",
  suporte: "bg-emerald-500/15 text-emerald-400",
};

const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** Distância até agora em linguagem corrente: "há 2 horas". */
function when(data: string) {
  const difference = Date.now() - new Date(data).getTime();
  const minutes = Math.round(difference / 60000);

  if (Math.abs(minutes) < 60) return formatter.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(-hours, "hour");

  return formatter.format(-Math.round(hours / 24), "day");
}

/**
 * Uma notificação, no sino e na página.
 *
 * Abrir a notificação já a marca como lida — é o que o clique significa. O
 * botão à direita existe para o caminho inverso (voltar a "não lida") e para
 * quem quer limpar o selo sem sair da página.
 */
export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: PlayerNotification;
  /** Fecha o popover quando o item é aberto de dentro do sino. */
  onNavigate?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const ItemIcon = ICONS[notification.type];

  function toggleRead() {
    startTransition(() => toggleReadState(notification.id, !notification.read));
  }

  return (
    <div
      data-pending={pending || undefined}
      className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-300 hover:bg-white/5 data-pending:opacity-60"
    >
      <span
        className={twMerge(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          COLORS[notification.type],
        )}
      >
        <ItemIcon className="size-5" weight="fill" aria-hidden="true" />
      </span>

      {/* Só vira link quando há para onde ir: comunicados do time se esgotam
          no próprio texto. */}
      <Body
        href={notification.href}
        onOpen={() => {
          onNavigate?.();
          if (!notification.read) toggleRead();
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className={twMerge(
              "text-sm leading-snug",
              notification.read
                ? "text-prime-light/70"
                : "font-semibold text-prime-light",
            )}
          >
            {notification.title}
          </span>

          {!notification.read && (
            <>
              {/* O ponto é decorativo; quem usa leitor de tela recebe o
                  estado pelo texto, não pela cor. */}
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-prime-red"
              />
              <span className="sr-only">Não lida</span>
            </>
          )}
        </span>

        <span className="mt-0.5 block text-prime-light/60 text-xs leading-relaxed">
          {notification.description}
        </span>

        <time
          dateTime={notification.data}
          className="mt-1 block text-[11px] text-prime-light/40"
        >
          {when(notification.data)}
        </time>
      </Body>

      <button
        type="button"
        onClick={toggleRead}
        disabled={pending}
        aria-label={
          notification.read ? "Marcar como não lida" : "Marcar como lida"
        }
        className={twMerge(
          "shrink-0 rounded p-1 transition-colors duration-300",
          notification.read
            ? "text-prime-light/30 hover:text-prime-light/70"
            : "text-prime-light/50 hover:text-prime-red",
        )}
      >
        <CheckIcon className="size-4" weight="bold" />
      </button>
    </div>
  );
}

function Body({
  href,
  onOpen,
  children,
}: {
  href?: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  if (!href) return <div className="min-w-0 flex-1">{children}</div>;

  return (
    <Link href={href} onClick={onOpen} className="min-w-0 flex-1">
      {children}
    </Link>
  );
}

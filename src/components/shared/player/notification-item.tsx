"use client";

import {
  ChatCircleIcon,
  CheckIcon,
  type Icon,
  MegaphoneIcon,
  PlayCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import type {
  NotificationType,
  PlayerNotification,
} from "@/services/notifications";
import { useNotifications } from "./notifications-provider";

const ICONS: Record<NotificationType, Icon> = {
  aula: PlayCircleIcon,
  aviso: MegaphoneIcon,
  suporte: ChatCircleIcon,
};

const COLORS: Record<NotificationType, string> = {
  aula: "bg-prime-red/15 text-prime-red",
  aviso: "bg-blue-500/15 text-blue-400",
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
 * Abrir a notificação já a marca como lida — é o que o clique significa. A
 * ação embaixo existe para o caminho inverso (voltar a "não lida") e para
 * quem quer limpar o selo sem sair da página.
 *
 * Ela é escrita, não um ✓ solto: sozinho, o ícone tanto pode dizer "isto
 * está lido" quanto "clique para marcar", e quem lê escolhe a errada.
 *
 * O estado de leitura vem do `NotificationsProvider`: muda no clique, aqui e
 * no selo do sino, e a gravação corre em segundo plano.
 */
export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: PlayerNotification;
  /** Fecha o popover quando o item é aberto de dentro do sino. */
  onNavigate?: () => void;
}) {
  const { isRead, toggle } = useNotifications();
  const read = isRead(notification);
  const ItemIcon = ICONS[notification.type];

  return (
    <div className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-300 hover:bg-white/5">
      <span
        className={twMerge(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          COLORS[notification.type],
        )}
      >
        <ItemIcon className="size-5" weight="fill" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col items-start">
        {/* Só vira link quando há para onde ir: comunicados do time se
            esgotam no próprio texto. */}
        <Body
          href={notification.href}
          onOpen={() => {
            onNavigate?.();
            if (!read) toggle(notification);
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className={twMerge(
                "text-sm leading-snug",
                read ? "text-prime-light/70" : "font-semibold text-prime-light",
              )}
            >
              {notification.title}
            </span>

            {!read && (
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
          onClick={() => toggle(notification)}
          className={twMerge(
            "mt-2 flex items-center gap-1.5 rounded text-xs transition-colors duration-300",
            read
              ? "text-prime-light/40 hover:text-prime-light/70"
              : "text-prime-light/60 hover:text-prime-red",
          )}
        >
          <CheckIcon className="size-3.5" weight="bold" aria-hidden="true" />
          {read ? "Marcar como não lida" : "Marcar como lida"}
        </button>
      </div>
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
  // `w-full`, e não `flex-1`: agora o corpo vive numa coluna com a ação
  // embaixo, e esticar na vertical deixaria o alvo do clique maior do que o
  // texto que ele contém.
  if (!href) return <div className="w-full min-w-0">{children}</div>;

  return (
    <Link href={href} onClick={onOpen} className="w-full min-w-0">
      {children}
    </Link>
  );
}

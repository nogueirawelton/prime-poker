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
import { alternarLeitura } from "@/actions/notificacoes";
import type { Notificacao, TipoNotificacao } from "@/services/notificacoes";

const ICONES: Record<TipoNotificacao, Icon> = {
  aula: PlayCircleIcon,
  aviso: MegaphoneIcon,
  conquista: TrophyIcon,
  suporte: ChatCircleIcon,
};

const CORES: Record<TipoNotificacao, string> = {
  aula: "bg-prime-red/15 text-prime-red",
  aviso: "bg-blue-500/15 text-blue-400",
  conquista: "bg-amber-500/15 text-amber-400",
  suporte: "bg-emerald-500/15 text-emerald-400",
};

const formatador = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** Distância até agora em linguagem corrente: "há 2 horas". */
function quando(data: string) {
  const diferenca = Date.now() - new Date(data).getTime();
  const minutos = Math.round(diferenca / 60000);

  if (Math.abs(minutos) < 60) return formatador.format(-minutos, "minute");

  const horas = Math.round(minutos / 60);
  if (Math.abs(horas) < 24) return formatador.format(-horas, "hour");

  return formatador.format(-Math.round(horas / 24), "day");
}

/**
 * Uma notificação, no sino e na página.
 *
 * Abrir a notificação já a marca como lida — é o que o clique significa. O
 * botão à direita existe para o caminho inverso (voltar a "não lida") e para
 * quem quer limpar o selo sem sair da página.
 */
export function NotificationItem({
  notificacao,
  onNavigate,
}: {
  notificacao: Notificacao;
  /** Fecha o popover quando o item é aberto de dentro do sino. */
  onNavigate?: () => void;
}) {
  const [pendente, startTransition] = useTransition();
  const Icone = ICONES[notificacao.tipo];

  function alternar() {
    startTransition(() => alternarLeitura(notificacao.id, !notificacao.lida));
  }

  return (
    <div
      data-pending={pendente || undefined}
      className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-300 hover:bg-white/5 data-pending:opacity-60"
    >
      <span
        className={twMerge(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          CORES[notificacao.tipo],
        )}
      >
        <Icone className="size-5" weight="fill" aria-hidden="true" />
      </span>

      {/* Só vira link quando há para onde ir: comunicados do time se esgotam
          no próprio texto. */}
      <Corpo
        href={notificacao.href}
        onOpen={() => {
          onNavigate?.();
          if (!notificacao.lida) alternar();
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className={twMerge(
              "text-sm leading-snug",
              notificacao.lida
                ? "text-prime-light/70"
                : "font-semibold text-prime-light",
            )}
          >
            {notificacao.titulo}
          </span>

          {!notificacao.lida && (
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
          {notificacao.descricao}
        </span>

        <time
          dateTime={notificacao.data}
          className="mt-1 block text-[11px] text-prime-light/40"
        >
          {quando(notificacao.data)}
        </time>
      </Corpo>

      <button
        type="button"
        onClick={alternar}
        disabled={pendente}
        aria-label={
          notificacao.lida ? "Marcar como não lida" : "Marcar como lida"
        }
        className={twMerge(
          "shrink-0 rounded p-1 transition-colors duration-300",
          notificacao.lida
            ? "text-prime-light/30 hover:text-prime-light/70"
            : "text-prime-light/50 hover:text-prime-red",
        )}
      >
        <CheckIcon className="size-4" weight="bold" />
      </button>
    </div>
  );
}

function Corpo({
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

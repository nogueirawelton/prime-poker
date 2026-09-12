"use client";

import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { concluirAula, salvarAula } from "@/actions/aula";

/** Salvar e marcar como concluído — os dois estados da aula para o jogador. */
export function AulaAcoes({
  slug,
  salva,
  concluida,
}: {
  slug: string;
  salva: boolean;
  concluida: boolean;
}) {
  const [pendente, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        disabled={pendente}
        onClick={() => startTransition(() => salvarAula(slug))}
        aria-pressed={salva}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md border px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
          salva
            ? "border-prime-red bg-prime-red/15 text-prime-light"
            : "border-white/20 text-prime-light hover:bg-white/5",
        )}
      >
        <BookmarkSimpleIcon
          className="size-4"
          weight={salva ? "fill" : "bold"}
        />
        {salva ? "Salva" : "Salvar"}
      </button>

      <button
        type="button"
        disabled={pendente}
        onClick={() => startTransition(() => concluirAula(slug))}
        aria-pressed={concluida}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
          concluida
            ? "bg-emerald-600 text-prime-light hover:bg-emerald-500"
            : "bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red",
        )}
      >
        {pendente ? (
          <SpinnerGapIcon className="size-4 animate-spin" />
        ) : (
          <CheckCircleIcon
            className="size-4"
            weight={concluida ? "fill" : "bold"}
          />
        )}
        {concluida ? "Concluída" : "Marcar como concluída"}
      </button>
    </div>
  );
}

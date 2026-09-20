"use client";

import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { completeLesson, saveLesson } from "@/actions/lesson";

/**
 * Salvar e marcar como concluído — os dois estados da aula para o jogador.
 *
 * Em aula trancada só sobra o salvar: guardar para depois é o que faz sentido
 * para quem ainda vai pedir upgrade, mas concluir uma aula que ele não pode
 * assistir não quer dizer nada — e ainda contaria no progresso da trilha.
 */
export function LessonActions({
  lessonId,
  saved,
  completed,
  canComplete,
}: {
  lessonId: number;
  saved: boolean;
  completed: boolean;
  canComplete: boolean;
}) {
  // Um estado por botão, e não um para os dois: com um só, salvar acendia o
  // carregando do "marcar como concluída" — parecia que o clique em salvar
  // estava concluindo a aula.
  const [saving, startSaving] = useTransition();
  const [completing, startCompleting] = useTransition();
  const pending = saving || completing;

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => startSaving(() => saveLesson(lessonId))}
        aria-pressed={saved}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md border px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
          saved
            ? "border-prime-red bg-prime-red/15 text-prime-light"
            : "border-white/20 text-prime-light hover:bg-white/5",
        )}
      >
        {saving ? (
          <SpinnerGapIcon className="size-4 animate-spin" />
        ) : (
          <BookmarkSimpleIcon
            className="size-4"
            weight={saved ? "fill" : "bold"}
          />
        )}
        {saved ? "Salva" : "Salvar"}
      </button>

      {canComplete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startCompleting(() => completeLesson(lessonId))}
          aria-pressed={completed}
          className={twMerge(
            "flex h-11 items-center gap-2 rounded-md px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
            completed
              ? "bg-emerald-600 text-prime-light hover:bg-emerald-500"
              : "bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red",
          )}
        >
          {completing ? (
            <SpinnerGapIcon className="size-4 animate-spin" />
          ) : (
            <CheckCircleIcon
              className="size-4"
              weight={completed ? "fill" : "bold"}
            />
          )}
          {completed ? "Concluída" : "Marcar como concluída"}
        </button>
      )}
    </div>
  );
}

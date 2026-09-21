"use client";

import { BookmarkSimpleIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";
import { completeLesson, saveLesson } from "@/actions/lesson";
import { useInstantToggle } from "@/hooks/use-instant-toggle";

/**
 * Salvar e marcar como concluído — os dois estados da aula para o jogador.
 *
 * Em aula trancada só sobra o salvar: guardar para depois é o que faz sentido
 * para quem ainda vai pedir upgrade, mas concluir uma aula que ele não pode
 * assistir não quer dizer nada — e ainda contaria no progresso da trilha.
 *
 * Os dois mudam no clique e gravam em segundo plano (`useInstantToggle`):
 * sem spinner e sem botão travado, cada um com o próprio estado.
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
  const [isSaved, toggleSaved] = useInstantToggle(saved, () =>
    saveLesson(lessonId),
  );
  const [isCompleted, toggleCompleted] = useInstantToggle(completed, () =>
    completeLesson(lessonId),
  );

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={isSaved}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md border px-4 font-semibold text-sm transition-all duration-500",
          isSaved
            ? "border-prime-red bg-prime-red/15 text-prime-light"
            : "border-white/20 text-prime-light hover:bg-white/5",
        )}
      >
        <BookmarkSimpleIcon
          className="size-4"
          weight={isSaved ? "fill" : "bold"}
        />
        {isSaved ? "Salva" : "Salvar"}
      </button>

      {canComplete && (
        <button
          type="button"
          onClick={toggleCompleted}
          aria-pressed={isCompleted}
          className={twMerge(
            "flex h-11 items-center gap-2 rounded-md px-4 font-semibold text-sm transition-all duration-500",
            isCompleted
              ? "bg-emerald-600 text-prime-light hover:bg-emerald-500"
              : "bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red",
          )}
        >
          <CheckCircleIcon
            className="size-4"
            weight={isCompleted ? "fill" : "bold"}
          />
          {isCompleted ? "Concluída" : "Marcar como concluída"}
        </button>
      )}
    </div>
  );
}

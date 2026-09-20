"use client";

import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { completeLesson, saveLesson } from "@/actions/lesson";

/** Salvar e marcar como concluído — os dois estados da aula para o jogador. */
export function LessonActions({
  lessonId,
  saved,
  completed,
}: {
  lessonId: number;
  saved: boolean;
  completed: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => saveLesson(lessonId))}
        aria-pressed={saved}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md border px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
          saved
            ? "border-prime-red bg-prime-red/15 text-prime-light"
            : "border-white/20 text-prime-light hover:bg-white/5",
        )}
      >
        <BookmarkSimpleIcon
          className="size-4"
          weight={saved ? "fill" : "bold"}
        />
        {saved ? "Salva" : "Salvar"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => completeLesson(lessonId))}
        aria-pressed={completed}
        className={twMerge(
          "flex h-11 items-center gap-2 rounded-md px-4 font-semibold text-sm transition-all duration-500 disabled:opacity-60",
          completed
            ? "bg-emerald-600 text-prime-light hover:bg-emerald-500"
            : "bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red",
        )}
      >
        {pending ? (
          <SpinnerGapIcon className="size-4 animate-spin" />
        ) : (
          <CheckCircleIcon
            className="size-4"
            weight={completed ? "fill" : "bold"}
          />
        )}
        {completed ? "Concluída" : "Marcar como concluída"}
      </button>
    </div>
  );
}

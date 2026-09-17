"use client";

import {
  DotsThreeVerticalIcon,
  PlayIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { formatDuration, type Lesson } from "@/services/lessons";
import { initials } from "@/utils/initials";

/** Iniciais do instrutor: o avatar real ainda não vem do CMS. */
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const progress = Math.min(
    100,
    Math.round((lesson.watched / lesson.duration) * 100),
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3 transition-all duration-500 hover:border-prime-red/50">
      <Link
        href={`/player/aulas/${lesson.slug}`}
        className="relative block aspect-16/9 w-full overflow-hidden"
      >
        {/* Capa provisória: gradiente por trilha no lugar do thumbnail. */}
        <div
          className={twMerge(
            "size-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
            lesson.track.cover,
          )}
        />

        <span
          className={twMerge(
            "absolute top-3 left-3 rounded px-2 py-1 font-bold text-[10px] uppercase tracking-wide",
            lesson.track.color,
          )}
        >
          {lesson.track.badge}
        </span>

        <span className="absolute right-3 bottom-3 rounded bg-prime-dark/80 px-1.5 py-0.5 font-semibold text-[11px] text-prime-light tabular-nums">
          {formatDuration(lesson.duration)}
        </span>

        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-prime-light/80 bg-prime-dark/40 backdrop-blur-sm transition-all duration-500 group-hover:border-prime-red group-hover:bg-prime-red"
        >
          <PlayIcon className="ml-0.5 size-6 text-prime-light" weight="fill" />
        </span>

        {progress > 0 && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-prime-light/15">
            <span
              className="block h-full bg-prime-red"
              style={{ width: `${progress}%` }}
            />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-base text-prime-light leading-snug transition-colors duration-500 group-hover:text-prime-red">
            <Link href={`/player/aulas/${lesson.slug}`}>{lesson.title}</Link>
          </h3>

          {/* TODO: menu de ações (salvar, marcar como assistida, compartilhar). */}
          <button
            type="button"
            aria-label={`Ações da aula ${lesson.title}`}
            className="-mr-1 shrink-0 rounded p-1 text-prime-light/50 transition-colors duration-500 hover:text-prime-light"
          >
            <DotsThreeVerticalIcon className="size-5" weight="bold" />
          </button>
        </div>

        <footer className="mt-auto flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 font-bold text-[10px] text-prime-light">
            {initials(lesson.instructor)}
          </span>
          <span className="text-prime-light/70 text-sm">
            {lesson.instructor}
          </span>
        </footer>
      </div>
    </article>
  );
}

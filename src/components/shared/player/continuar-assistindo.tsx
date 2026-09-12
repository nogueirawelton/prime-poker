import { PlayIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import type { Aula } from "@/services/aulas";

/** Retomada da última aula em andamento, fixa no rodapé da sidebar. */
export function ContinuarAssistindo({ aula }: { aula: Aula }) {
  const progresso = Math.min(
    100,
    Math.round((aula.assistido / aula.duracao) * 100),
  );

  return (
    <Link
      href={`/player/aulas/${aula.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3 transition-all duration-500 hover:border-prime-red/50"
    >
      <strong className="px-4 pt-4 font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
        Continue assistindo
      </strong>

      <div className="relative mx-4 mt-3 aspect-16/9 overflow-hidden rounded-lg">
        <div
          className={twMerge(
            "size-full bg-gradient-to-br",
            aula.categoria.capa,
          )}
        />

        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-prime-dark/60 backdrop-blur-sm transition-colors duration-500 group-hover:bg-prime-red"
        >
          <PlayIcon className="ml-0.5 size-4 text-prime-light" weight="fill" />
        </span>
      </div>

      <p className="line-clamp-2 px-4 pt-3 font-semibold text-prime-light text-sm leading-snug">
        {aula.titulo}
      </p>

      <div className="flex items-center gap-2 px-4 pt-3 pb-4">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-prime-light/15">
          <span
            className="block h-full bg-prime-red"
            style={{ width: `${progresso}%` }}
          />
        </span>
        <span className="text-prime-light/50 text-xs tabular-nums">
          {progresso}%
        </span>
      </div>
    </Link>
  );
}

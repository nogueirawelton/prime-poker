import {
  ArrowRightIcon,
  ClockIcon,
  PlayCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { formatDuration, type RelatedLesson } from "@/lib/lessons";

/**
 * Chamada para a aula que o post divulga, no fim do texto.
 *
 * Fica no corpo, e não só na lateral, por dois motivos: a coluna de apoio
 * some abaixo de `lg` — no celular a aula simplesmente não existia — e quem
 * chegou ao fim do artigo é justamente quem quer o próximo passo.
 *
 * O link vai direto para a aula, sem checar nada aqui: a área do jogador já
 * manda para o login quem não entrou e mostra o cadeado com o tier necessário
 * para quem entrou sem o plano. Decidir isso duas vezes só criaria duas
 * respostas para a mesma pergunta.
 */
export function LessonCallout({ lesson }: { lesson: RelatedLesson | null }) {
  if (!lesson) return null;

  return (
    <section className="mt-12 max-w-3xl">
      <Link
        href={`/player/aulas/${lesson.slug}`}
        className="group flex flex-col gap-5 rounded-xl border border-prime-red/40 bg-prime-red/5 p-6 transition-colors duration-500 hover:border-prime-red sm:flex-row sm:items-center sm:gap-6"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-prime-red/20 text-prime-red transition-colors duration-500 group-hover:bg-prime-red group-hover:text-prime-light">
          <PlayCircleIcon className="size-7" weight="fill" aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[11px] text-prime-red uppercase tracking-wider">
            Aula recomendada
          </span>

          <strong className="mt-1 block font-bold text-lg text-prime-light leading-snug">
            {lesson.title}
          </strong>

          <span className="mt-2 block text-prime-light/70 text-sm leading-relaxed">
            Este artigo explicou a teoria. Na aula,{" "}
            {lesson.instructor || "o instrutor"} mostra o mesmo tema na prática,
            com mãos comentadas.
          </span>

          {(lesson.instructor || lesson.duration > 0) && (
            <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-prime-light/50 text-xs">
              {lesson.instructor && <span>{lesson.instructor}</span>}
              {lesson.duration > 0 && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3.5" aria-hidden="true" />
                  {formatDuration(lesson.duration)}
                </span>
              )}
            </span>
          )}
        </span>

        <span className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-prime-red px-5 font-semibold text-prime-light text-sm transition-all duration-500 group-hover:bg-prime-light group-hover:text-prime-red">
          Assistir aula
          <ArrowRightIcon
            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
            weight="bold"
            aria-hidden="true"
          />
        </span>
      </Link>
    </section>
  );
}

import { ArrowRightIcon, PlayCircleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { FormDialog } from "@/components/shared/form-dialog";
import { formatDuration, type RelatedLesson } from "@/lib/lessons";
import type { Post } from "@/services/blog";
import type { Section } from "@/utils/rich-content";
import { TableOfContents } from "./table-of-contents";

/**
 * Coluna de apoio do artigo: índice, chamada e leituras relacionadas.
 *
 * `sticky` no topo: a coluna acompanha a leitura em telas grandes e some
 * abaixo de `lg`, onde empilhar tudo isso antes do texto só atrapalharia.
 */
export function PostSidebar({
  sections,
  related,
  lesson,
}: {
  sections: Array<Section>;
  related: Array<Post>;
  /** Aula escolhida no campo *Aula relacionada* do post, se houver. */
  lesson: RelatedLesson | null;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-32 flex flex-col gap-6">
        <TableOfContents sections={sections} />

        <GoDeeper lesson={lesson} />

        {related.length > 0 && (
          <nav
            aria-label="Artigos relacionados"
            className="rounded-xl border border-white/10 bg-white/3 p-5"
          >
            <strong className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
              Artigos relacionados
            </strong>

            <ul className="mt-4 flex flex-col gap-4">
              {related.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-2 text-prime-light/80 text-sm leading-snug transition-colors duration-300 hover:text-prime-red"
                  >
                    <ArrowRightIcon
                      className="mt-1 size-3.5 shrink-0 text-prime-light/30 transition-colors duration-300 group-hover:text-prime-red"
                      aria-hidden="true"
                    />
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </aside>
  );
}

/**
 * Chamada para a aula relacionada ao post.
 *
 * Sem aula escolhida no painel, cai na chamada institucional — a coluna não
 * pode ficar com um buraco, e quem chegou até aqui é justamente quem vale
 * convidar.
 */
function GoDeeper({ lesson }: { lesson: RelatedLesson | null }) {
  if (!lesson) {
    return (
      <div className="rounded-xl border border-prime-red/40 bg-prime-red/5 p-5">
        <strong className="block font-bold text-lg text-prime-light">
          Quer se aprofundar?
        </strong>

        <p className="mt-2 text-prime-light/70 text-sm leading-relaxed">
          O Prime Poker Team treina jogadores com aulas, análise de mãos e
          acompanhamento de perto.
        </p>

        <FormDialog>
          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-prime-red font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
          >
            Quero fazer parte
          </button>
        </FormDialog>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-prime-red/40 bg-prime-red/5 p-5">
      <strong className="block font-bold text-lg text-prime-light">
        Quer se aprofundar?
      </strong>

      <p className="mt-2 text-prime-light/70 text-sm leading-relaxed">
        Veja a aula completa sobre o tema, com exemplos comentados.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-white/10 bg-prime-dark/40 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-prime-red/20 text-prime-red">
          <PlayCircleIcon className="size-5" weight="fill" aria-hidden="true" />
        </span>

        <span className="min-w-0">
          <span className="block font-semibold text-prime-light text-sm leading-snug">
            {lesson.title}
          </span>
          {(lesson.instructor || lesson.duration > 0) && (
            <span className="mt-0.5 block text-prime-light/50 text-xs">
              {[
                lesson.instructor,
                lesson.duration > 0 && formatDuration(lesson.duration),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </span>
      </div>

      <Link
        href={`/player/aulas/${lesson.slug}`}
        className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-prime-red font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
      >
        Assistir aula
      </Link>
    </div>
  );
}

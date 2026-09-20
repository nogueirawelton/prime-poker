import { EyeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { LessonActions } from "@/components/pages/player/lessons/lesson-actions";
import { LessonCard } from "@/components/pages/player/lessons/lesson-card";
import { LessonPlayer } from "@/components/pages/player/lessons/lesson-player";
import { Materials } from "@/components/pages/player/lessons/materials";
import { Questions } from "@/components/pages/player/lessons/questions";
import { UpgradeButton } from "@/components/shared/player/upgrade-button";
import { formatDuration } from "@/lib/lessons";
import { getLesson, getNextLessons } from "@/services/lesson-detail";

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLesson(slug);

  if (!lesson) return {};

  return { title: `${lesson.title} | Prime Poker Team` };
}

export default function LessonPage({ params }: Props) {
  // A aula depende do slug e do estado do jogador, que só existem em tempo de
  // requisição: tudo atrás do boundary, como nas outras telas da área.
  return (
    <Suspense fallback={<Skeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
  const { slug } = await params;
  const lesson = await getLesson(slug);

  if (!lesson) notFound();

  const nextLessons = await getNextLessons(lesson);

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Aulas", href: "/player/aulas" },
          ...(lesson.track
            ? [
                {
                  label: lesson.track.name,
                  href: `/player/aulas?cat=${lesson.track.slug}`,
                },
              ]
            : []),
          { label: lesson.title },
        ]}
      />

      <LessonPlayer
        lessonId={lesson.databaseId}
        title={lesson.title}
        video={lesson.video}
        locked={
          lesson.canWatch ? null : { tierLabel: lesson.minimumTier.label }
        }
        upgrade={
          lesson.canWatch ? null : (
            <UpgradeButton
              label="Quero liberar esta aula"
              suggestedTier={lesson.minimumTier.label}
              lessonTitle={lesson.title}
            />
          )
        }
        image={lesson.image}
        trackColor={lesson.track?.color ?? null}
        // Rever uma aula concluída começa do início.
        watched={lesson.completed ? 0 : lesson.watched}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-bold text-2xl text-prime-light leading-tight lg:text-3xl">
            {lesson.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-prime-light/60 text-sm">
            {lesson.instructor && (
              <span className="font-medium text-prime-light/80">
                {lesson.instructor}
              </span>
            )}
            <time dateTime={lesson.data}>
              {dateFormatter.format(new Date(lesson.data))}
            </time>
            {lesson.duration > 0 && (
              <span>{formatDuration(lesson.duration)}</span>
            )}
            <span className="flex items-center gap-1.5">
              <EyeIcon className="size-4" aria-hidden="true" />
              {numberFormatter.format(lesson.views)} visualizações
            </span>
          </div>
        </div>

        <LessonActions
          lessonId={lesson.databaseId}
          saved={lesson.saved}
          completed={lesson.completed}
          canComplete={lesson.canWatch}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Section title="Descrição">
          {/* `rich-text` é a tipografia do conteúdo vindo do editor, a mesma
              usada nos posts do blog. */}
          {lesson.description ? (
            <div
              className="rich-text"
              dangerouslySetInnerHTML={{ __html: lesson.description }}
            />
          ) : (
            <p className="text-prime-light/50 text-sm">
              Esta aula ainda não tem descrição.
            </p>
          )}
        </Section>

        <Section title="Material de apoio">
          <Materials materials={lesson.materials} />
        </Section>
      </div>

      <Section title="Dúvidas com o instrutor">
        <Questions
          lessonId={lesson.databaseId}
          questions={lesson.questions}
          instructor={lesson.instructor}
          canAsk={lesson.canWatch}
        />
      </Section>

      {lesson.track && nextLessons.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-prime-light uppercase">
            Continue na trilha {lesson.track.name}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {nextLessons.map((nextLesson) => (
              <LessonCard key={nextLesson.id} lesson={nextLesson} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3">
      <h2 className="border-white/10 border-b px-5 py-4 font-bold text-prime-light text-sm uppercase tracking-wide">
        {title}
      </h2>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:px-8"
    >
      <div className="aspect-video w-full animate-pulse rounded-xl border border-white/10 bg-white/3" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-white/5" />
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/3" />
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/3" />
      </div>
    </div>
  );
}

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileCard } from "@/components/pages/player/dashboard/profile-card";
import { ProgressCard } from "@/components/pages/player/dashboard/progress-card";
import { LessonCard } from "@/components/pages/player/lessons/lesson-card";
import { ContinueWatching } from "@/components/shared/player/continue-watching";
import { NotificationItem } from "@/components/shared/player/notification-item";
import { getSavedLessons } from "@/services/lesson-detail";
import { getContinueWatching } from "@/services/lessons";
import { listNotifications } from "@/services/notifications";
import { getProfile, getProgress } from "@/services/profile";

export const metadata: Metadata = {
  title: "Área do Jogador | Prime Poker Team",
};

/** Quantas aulas salvas o painel mostra antes de mandar para a listagem. */
const VISIBLE_SAVED = 4;

export default function PlayerHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      {/* Tudo aqui é do usuário logado, então nada disso entra no shell
          estático: cada bloco tem o próprio boundary e chega quando resolve. */}
      <Suspense fallback={<Block className="h-36" />}>
        <Profile />
      </Suspense>

      <Suspense fallback={<Block className="h-64" />}>
        <Study />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Suspense fallback={<Block className="h-72" />}>
          <SavedLessons />
        </Suspense>

        <Suspense fallback={<Block className="h-72" />}>
          <Notifications />
        </Suspense>
      </div>
    </div>
  );
}

async function Profile() {
  const [profile, continueWatching] = await Promise.all([
    getProfile(),
    getContinueWatching(),
  ]);

  // A coluna de 24rem só existe quando há o que retomar: sem aula em
  // andamento, ela ficaria como um vão vazio à direita do perfil. Nesse caso
  // o card do perfil toma a linha inteira.
  return (
    <div
      className={
        continueWatching ? "grid gap-6 lg:grid-cols-[1fr_24rem]" : "grid gap-6"
      }
    >
      <ProfileCard profile={profile} />

      {continueWatching && (
        <div className="rounded-xl border border-white/10 bg-white/3 p-2">
          <ContinueWatching lesson={continueWatching} />
        </div>
      )}
    </div>
  );
}

async function Study() {
  const [progress, savedLessons] = await Promise.all([
    getProgress(),
    getSavedLessons(),
  ]);

  return (
    <ProgressCard progress={progress} savedLessons={savedLessons.length} />
  );
}

async function SavedLessons() {
  const savedLessons = await getSavedLessons();

  return (
    <Section
      title="Aulas salvas"
      action={{ label: "Ver acervo", href: "/player/aulas" }}
    >
      {savedLessons.length === 0 ? (
        <p className="py-10 text-center text-prime-light/50 text-sm">
          Nada salvo ainda. Use o botão “Salvar” dentro de uma aula para montar
          sua lista.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savedLessons.slice(0, VISIBLE_SAVED).map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </Section>
  );
}

async function Notifications() {
  const notifications = await listNotifications("todas", 4);

  return (
    <Section
      title="Últimas notificações"
      action={{ label: "Ver todas", href: "/player/notificacoes" }}
    >
      {notifications.length === 0 ? (
        <p className="py-10 text-center text-prime-light/50 text-sm">
          Nenhuma notificação por aqui.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3">
      <header className="flex items-center justify-between gap-3 border-white/10 border-b px-5 py-4">
        <h2 className="font-bold text-prime-light text-sm uppercase tracking-wide">
          {title}
        </h2>

        <Link
          href={action.href}
          className="flex items-center gap-1.5 text-prime-light/60 text-xs transition-colors duration-500 hover:text-prime-red"
        >
          {action.label}
          <ArrowRightIcon className="size-3.5" weight="bold" />
        </Link>
      </header>

      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}

function Block({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl border border-white/10 bg-white/3 ${className}`}
    />
  );
}

"use client";

import {
  DotsThreeVerticalIcon,
  LinkSimpleIcon,
  LockSimpleIcon,
  PlayIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
import {
  formatDuration,
  type Lesson,
  NEUTRAL_COVER,
  watchedPercentage,
} from "@/lib/lessons";
import { initials } from "@/utils/initials";

/**
 * Card da aula na listagem.
 *
 * Aula acima do tier do jogador continua aparecendo — é o convite ao
 * upgrade —, mas com cadeado no lugar do play e o tier exigido no canto.
 * O link leva à página da aula, que explica o bloqueio.
 */
export function LessonCard({ lesson }: { lesson: Lesson }) {
  const href = `/player/aulas/${lesson.slug}`;
  const progress = watchedPercentage(lesson);
  const locked = !lesson.canWatch;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3 transition-all duration-500 hover:border-prime-red/50">
      <Link
        href={href}
        className="relative block aspect-16/9 w-full overflow-hidden"
      >
        {lesson.image ? (
          <Image
            src={lesson.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={twMerge(
              "object-cover transition-transform duration-700 group-hover:scale-105",
              locked && "opacity-50 grayscale",
            )}
          />
        ) : (
          <div
            className={twMerge(
              "size-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
              lesson.track?.cover ?? NEUTRAL_COVER,
            )}
          />
        )}

        {lesson.track && (
          <span
            className={twMerge(
              "absolute top-3 left-3 rounded px-2 py-1 font-bold text-[10px] uppercase tracking-wide",
              lesson.track.color,
            )}
          >
            {lesson.track.badge}
          </span>
        )}

        {locked && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded bg-prime-dark/85 px-2 py-1 font-bold text-[10px] text-amber-400 uppercase tracking-wide">
            <LockSimpleIcon
              className="size-3"
              weight="bold"
              aria-hidden="true"
            />
            {lesson.minimumTier.label}
          </span>
        )}

        {lesson.duration > 0 && (
          <span className="absolute right-3 bottom-3 rounded bg-prime-dark/80 px-1.5 py-0.5 font-semibold text-[11px] text-prime-light tabular-nums">
            {formatDuration(lesson.duration)}
          </span>
        )}

        <span
          aria-hidden="true"
          className={twMerge(
            "absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-prime-light/80 bg-prime-dark/40 backdrop-blur-sm transition-all duration-500",
            locked
              ? "group-hover:border-amber-400"
              : "group-hover:border-prime-red group-hover:bg-prime-red",
          )}
        >
          {locked ? (
            <LockSimpleIcon className="size-6 text-prime-light" weight="fill" />
          ) : (
            <PlayIcon
              className="ml-0.5 size-6 text-prime-light"
              weight="fill"
            />
          )}
        </span>

        {locked && (
          <span className="sr-only">
            Aula exclusiva para {lesson.minimumTier.label} ou superior
          </span>
        )}

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
            <Link href={href}>{lesson.title}</Link>
          </h3>

          <Actions lesson={lesson} href={href} />
        </div>

        {lesson.instructor && (
          <footer className="mt-auto flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/10 font-bold text-[10px] text-prime-light">
              {initials(lesson.instructor)}
            </span>
            <span className="text-prime-light/70 text-sm">
              {lesson.instructor}
            </span>
          </footer>
        )}
      </div>
    </article>
  );
}

/**
 * Menu ⋮ do card.
 *
 * Por enquanto só compartilhar: salvar e marcar como assistida entram quando
 * esse estado for gravado por jogador (etapa 8) — antes disso o card não tem
 * como mostrar se a aula já está salva.
 */
function Actions({ lesson, href }: { lesson: Lesson; href: string }) {
  function url() {
    return new URL(href, window.location.origin).toString();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url());
      toast.success("Link da aula copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: lesson.title, url: url() });
    } catch {
      // Cancelar a janela de compartilhamento também cai aqui: não é erro.
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Ações da aula ${lesson.title}`}
        className="-mr-1 shrink-0 rounded p-1 text-prime-light/50 outline-none transition-colors duration-500 hover:text-prime-light focus-visible:text-prime-light data-[state=open]:text-prime-light"
      >
        <DotsThreeVerticalIcon className="size-5" weight="bold" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-52 rounded-xl border border-white/10 bg-prime-darkgray p-2 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
        >
          <Item icon={LinkSimpleIcon} onSelect={copyLink}>
            Copiar link
          </Item>

          {/* Só onde o sistema oferece a janela nativa (celular, Safari). */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Item icon={ShareNetworkIcon} onSelect={share}>
              Compartilhar
            </Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  icon: ItemIcon,
  onSelect,
  children,
}: {
  icon: typeof LinkSimpleIcon;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-prime-light/80 text-sm outline-none transition-colors duration-300 data-highlighted:bg-prime-red/15 data-highlighted:text-prime-red"
    >
      <ItemIcon className="size-4" weight="bold" />
      {children}
    </DropdownMenu.Item>
  );
}

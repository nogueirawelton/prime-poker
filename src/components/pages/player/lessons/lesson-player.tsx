"use client";

import { LockSimpleIcon, PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { registerLessonView } from "@/actions/lesson";

type Props = {
  lessonId: number;
  title: string;
  /** Link assinado do player do Bunny; `null` sem acesso ou sem vídeo. */
  video: string | null;
  /** `null` quando o jogador pode assistir. */
  locked: { tierLabel: string } | null;
  image: string | null;
  /** Gradiente da trilha, usado quando não há imagem. */
  cover: string;
};

/**
 * Player da aula.
 *
 * O vídeo é o player do Bunny Stream num iframe. O link vem assinado do
 * WordPress, com validade, e só para quem tem o tier da aula; o Bunny ainda
 * confere o domínio de quem incorpora.
 *
 * Sem acesso, o lugar do vídeo vira o aviso do tier exigido. Sem vídeo
 * cadastrado, a capa com o play desabilitado — um player vazio pareceria
 * quebrado.
 */
export function LessonPlayer({
  lessonId,
  title,
  video,
  locked,
  image,
  cover,
}: Props) {
  // Conta a visualização de quem de fato abriu a aula (ver a action).
  useEffect(() => {
    if (!locked) registerLessonView(lessonId);
  }, [lessonId, locked]);

  if (locked) {
    return (
      <Poster image={image} cover={cover}>
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-amber-400/60 bg-prime-dark/60">
          <LockSimpleIcon
            className="size-7 text-amber-400"
            weight="fill"
            aria-hidden="true"
          />
        </span>

        <div className="max-w-md px-6">
          <p className="font-bold text-lg text-prime-light">
            Aula exclusiva para {locked.tierLabel} ou superior
          </p>
          <p className="mt-1 text-prime-light/60 text-sm">
            Fale com a equipe do Prime Poker Team para liberar o seu acesso.
          </p>
        </div>
      </Poster>
    );
  }

  if (!video) {
    return (
      <Poster image={image} cover={cover}>
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-prime-light/40 bg-prime-dark/40">
          <PlayIcon
            className="ml-1 size-7 text-prime-light/60"
            weight="fill"
            aria-hidden="true"
          />
        </span>
        <p className="text-prime-light/60 text-sm">
          Vídeo em breve nesta aula.
        </p>
      </Poster>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-prime-dark">
      <iframe
        src={video}
        title={title}
        className="absolute inset-0 size-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

function Poster({
  image,
  cover,
  children,
}: {
  image: string | null;
  cover: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={twMerge(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br",
        cover,
      )}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1536px) 1536px, 100vw"
          className="object-cover opacity-30 blur-sm"
        />
      )}

      <div className="relative flex flex-col items-center gap-3 text-center">
        {children}
      </div>
    </div>
  );
}

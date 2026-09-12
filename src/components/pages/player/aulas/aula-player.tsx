"use client";

import { PlayIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";

// `ssr: false` como no `ScaledVideo`: o player toca no `document` ao montar.
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

/**
 * Player da aula.
 *
 * Enquanto o CMS não devolve a URL do vídeo, mostra a capa da trilha com o
 * botão de play desabilitado — um player vazio pareceria quebrado.
 */
export function AulaPlayer({
  url,
  capa,
  titulo,
}: {
  url?: string;
  /** Gradiente da trilha, usado no lugar do poster. */
  capa: string;
  titulo: string;
}) {
  if (!url) {
    return (
      <div
        className={twMerge(
          "flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br",
          capa,
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full border-2 border-prime-light/40">
            <PlayIcon
              className="ml-1 size-7 text-prime-light/60"
              weight="fill"
              aria-hidden="true"
            />
          </span>
          <p className="text-prime-light/50 text-sm">
            Vídeo em breve nesta aula.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-prime-dark">
      <ReactPlayer
        src={url}
        controls
        playsInline
        width="100%"
        height="100%"
        title={titulo}
      />
    </div>
  );
}

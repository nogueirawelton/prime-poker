"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vídeo de fundo hospedado no próprio WordPress.
 *
 * Nunca é ele quem pinta primeiro. Por baixo fica o poster — o primeiro frame
 * do próprio vídeo, servido como imagem otimizada e com art direction — que é
 * quem responde pelo LCP. O vídeo só começa a baixar depois do `load` da
 * página, e aparece quando já está rodando.
 *
 * Isso existe porque o arquivo passa de 3 MB: em `autoplay`, esse download
 * disputava banda com o CSS, a fonte e a imagem justamente na janela em que o
 * LCP é medido. Adiar não custa nada visualmente, porque o primeiro frame do
 * vídeo é exatamente a imagem que já está na tela.
 *
 * `preload="none"` também evita o download duplo: o banner renderiza a versão
 * mobile e a desktop escondendo uma com `lg:hidden`, e `display: none` não
 * impede o navegador de buscar metadados.
 */
export function NativeVideo({
  src,
  fadeIn = false,
  className = "",
}: {
  src: string;
  /** Há um poster por baixo: nasce invisível e entra quando começa a rodar. */
  fadeIn?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Quem pediu menos movimento fica com o poster — e não baixa o vídeo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    function start() {
      if (cancelled || !video) return;

      // O elemento escondido pelo breakpoint não tem caixa de layout: não faz
      // sentido baixar o vídeo que ninguém vai ver.
      const visible =
        typeof video.checkVisibility === "function"
          ? video.checkVisibility()
          : video.offsetParent !== null;

      if (!visible) return;

      video.load();
      // Autoplay mudo é permitido, mas a promise ainda pode ser rejeitada
      // (economia de bateria, por exemplo). Aí o poster simplesmente fica.
      video.play().catch(() => {});
    }

    function schedule() {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(start, { timeout: 2000 });
        return;
      }

      window.setTimeout(start, 200);
    }

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      // Sem transição de propósito. O primeiro frame do vídeo é o poster que
      // já está na tela, então a troca é invisível — um fade só criaria uma
      // mudança visual onde não havia nenhuma.
      className={`absolute inset-0 size-full object-cover ${
        fadeIn && !playing ? "opacity-0" : ""
      } ${className}`}
    />
  );
}

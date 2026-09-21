"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo de fundo hospedado no próprio WordPress.
 *
 * Um `<video muted loop>` faz o que o react-player fazia aqui, sem os ~110 KB
 * dele e — o que importa para o LCP — sem depender de JavaScript para
 * aparecer: o elemento já vem no HTML do servidor.
 *
 * Duas decisões sustentam o resto:
 *
 * `preload="none"` evita o download duplo. O banner renderiza a versão mobile
 * e a desktop e esconde uma com `lg:hidden`, mas `display: none` não impede o
 * navegador de buscar metadados. Sem preload, nada começa sozinho.
 *
 * A reprodução só começa depois do `load` da página. O vídeo do banner passa
 * de 3 MB: deixá-lo em `autoplay` fazia esse download disputar banda com o
 * CSS, a fonte e as imagens justamente na janela em que o LCP é medido. Como
 * ele é decorativo e fica atrás de um gradiente, atrasar alguns instantes não
 * custa nada visualmente e libera a rede para o conteúdo.
 */
export function NativeVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Quem pediu menos movimento não recebe vídeo de fundo — nem o download.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    function start() {
      if (cancelled || !video) return;

      // O elemento escondido pelo breakpoint não tem caixa de layout: não
      // faz sentido baixar o vídeo que ninguém vai ver. `offsetParent` é o
      // teste de `display: none` que funciona em qualquer navegador aqui —
      // o elemento é `absolute` dentro de um ancestral posicionado.
      const visible =
        typeof video.checkVisibility === "function"
          ? video.checkVisibility()
          : video.offsetParent !== null;

      if (!visible) return;

      video.load();
      // Autoplay mudo é permitido, mas a promise ainda pode ser rejeitada
      // (economia de bateria, por exemplo). É decorativo: seguimos sem ele.
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
      className={`absolute inset-0 size-full bg-prime-dark object-cover ${className}`}
    />
  );
}

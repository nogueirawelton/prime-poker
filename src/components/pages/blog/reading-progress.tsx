"use client";

import { useEffect, useState } from "react";

/**
 * Barra fina indicando o quanto do artigo já foi lido.
 *
 * Fica logo abaixo do header, mas NÃO é filha dele: se fosse, herdaria o
 * transform do auto-hide e sumiria junto — justamente durante a leitura
 * contínua, que é quando o progresso importa. Em vez disso ela espelha o
 * estado do header e desliza para o topo quando ele se recolhe.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [offset, setOffset] = useState(0);
  const [headerHidden, setHeaderHidden] = useState(false);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    function sync() {
      setOffset((header as HTMLElement).offsetHeight);
      setHeaderHidden((header as HTMLElement).dataset.hidden === "true");
    }

    sync();

    // `data-hidden` muda fora de qualquer evento de scroll nosso: observar o
    // atributo é mais barato e confiável do que medir a cada frame.
    const attributes = new MutationObserver(sync);
    attributes.observe(header, {
      attributes: true,
      attributeFilter: ["data-hidden"],
    });

    // A altura do header muda no breakpoint lg.
    const size = new ResizeObserver(sync);
    size.observe(header);

    return () => {
      attributes.disconnect();
      size.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    function update() {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;

        setProgress(scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100);
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Progresso da leitura"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      // z-30: acima do conteúdo, abaixo do header (z-40) e do menu mobile (z-50).
      // A duração casa com a do header para os dois se moverem juntos.
      className="fixed inset-x-0 top-0 z-30 h-1 transition-transform duration-500"
      style={{
        transform: `translateY(${headerHidden ? 0 : offset}px)`,
      }}
    >
      <div
        className="h-full bg-prime-red transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

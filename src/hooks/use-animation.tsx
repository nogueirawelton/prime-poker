"use client";

import { type ComponentProps, useEffect, useRef } from "react";

/**
 * Distância da viewport em que o GSAP começa a ser baixado.
 *
 * Precisa ser generosa: as animações são `from({ autoAlpha: 0 })`, que
 * escondem o elemento no instante em que a timeline é criada. Se o módulo
 * chegasse com a seção já visível, o conteúdo piscaria — apareceria, sumiria
 * e voltaria. Com essa margem a timeline nasce enquanto a seção ainda está
 * fora da tela, e o ScrollTrigger dispara normalmente ao entrar.
 */
const PRELOAD_MARGIN = "600px";

interface AnimationContainerProps extends ComponentProps<"div"> {
  animation?: string;
}

export function AnimationContainer({
  children,
  animation,
  ...props
}: AnimationContainerProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!animation || !element) return;

    // Quem pediu menos animação não paga o download do GSAP.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    async function load(target: HTMLDivElement) {
      const { runAnimation } = await import("@/animations/runtime");

      // O componente pode ter desmontado durante o download.
      if (cancelled) return;

      revert = runAnimation(animation as string, target);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        load(element);
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
      revert?.();
    };
  }, [animation]);

  return (
    <div ref={container} {...props}>
      {children}
    </div>
  );
}

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

gsap.registerPlugin(ScrollTrigger);

interface SmootherContextProps {
  scrollTo: (target: string | null) => void;
}

const SmootherContext = createContext({} as SmootherContextProps);

export function SmootherProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  const scrollTo = useCallback((target: string | null) => {
    if (!target) return;

    const element = document.querySelector(target);
    if (!element) return;

    history.pushState(null, "", target);

    // A compensação do header fixo vem do `scroll-pt-*` no <html>: tanto o
    // Lenis quanto o scrollIntoView nativo respeitam scroll-padding-top, então
    // ela fica definida num lugar só.
    if (!lenisRef.current) {
      // Reduced motion (ou antes da montagem): scroll nativo, sem animação.
      element.scrollIntoView();
      return;
    }

    lenisRef.current.scrollTo(element as HTMLElement);
  }, []);

  useEffect(() => {
    // Respeita quem pediu menos animação no sistema: mantém o scroll nativo.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      anchors: true,
      // Em touch o scroll nativo já é suave: interceptar prejudica a resposta.
      syncTouch: false,
    });

    lenisRef.current = lenis;

    // O ScrollTrigger precisa recalcular a cada frame do Lenis.
    lenis.on("scroll", ScrollTrigger.update);

    // Uma única fonte de tempo (o ticker do GSAP) evita dois RAF concorrentes.
    function raf(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Âncora presente na URL ao abrir a página.
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const timeout = setTimeout(() => scrollTo(hash), 600);

    return () => clearTimeout(timeout);
  }, [scrollTo]);

  return <SmootherContext value={{ scrollTo }}>{children}</SmootherContext>;
}

export function useSmoother() {
  return useContext(SmootherContext);
}

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
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

  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const cameFromHistory = useRef(false);

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
      // Ao clicar num link para outro pathname o Lenis chama `reset()`,
      // matando a inércia. Sem isso ela continua decaindo e sobrescreve o
      // scroll-para-o-topo do router no frame seguinte.
      stopInertiaOnNavigate: true,
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

  // Voltar/avançar deve restaurar a posição; só a navegação "para frente"
  // vai ao topo. O popstate chega antes do commit da nova rota.
  useEffect(() => {
    function onPopState() {
      cameFromHistory.current = true;
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Página nova começa no topo.
  //
  // O `SmootherProvider` vive no layout do grupo `(institucional)`, então não
  // remonta ao navegar entre home e blog: a instância do Lenis atravessa a
  // troca de rota carregando o scroll da página anterior.
  // `pathname` é o gatilho do efeito, não um valor lido no corpo: removê-la
  // faria o efeito rodar só na montagem, que é exatamente o bug corrigido aqui.
  // biome-ignore lint/correctness/useExhaustiveDependencies: gatilho de rota
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (cameFromHistory.current) {
      cameFromHistory.current = false;
      return;
    }

    // URL com âncora: o destino é a seção, não o topo.
    if (window.location.hash) return;

    const lenis = lenisRef.current;

    if (!lenis) {
      // Reduced motion: o Lenis nunca foi criado.
      window.scrollTo(0, 0);
      return;
    }

    // `resize()` antes do `scrollTo` por dois motivos: re-sincroniza
    // `animatedScroll`/`targetScroll` com o DOM real (sem isso o `scrollTo`
    // vira no-op quando o alvo já é igual ao `targetScroll`) e recalcula o
    // `limit` na hora, contornando o debounce de 250ms do ResizeObserver.
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // Âncora na URL — inclusive vinda de outra rota (`/#quem-somos` a partir do
  // blog). O `anchors` do Lenis não cobre esse caso: ele exige mesmo pathname.
  // `pathname` é o gatilho do efeito, não um valor lido no corpo: removê-la
  // faria o efeito rodar só na montagem, que é exatamente o bug corrigido aqui.
  // biome-ignore lint/correctness/useExhaustiveDependencies: gatilho de rota
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const timeout = setTimeout(() => scrollTo(hash), 600);

    return () => clearTimeout(timeout);
  }, [scrollTo, pathname]);

  return <SmootherContext value={{ scrollTo }}>{children}</SmootherContext>;
}

export function useSmoother() {
  return useContext(SmootherContext);
}

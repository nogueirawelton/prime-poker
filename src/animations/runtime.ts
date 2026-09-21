import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import animations from "./index";
import type { Wrapper } from "./types";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ponto de entrada das animações — e o único módulo que importa o GSAP.
 *
 * Tudo aqui é decorativo, então nada disso pode pesar no carregamento
 * inicial: o `AnimationContainer` importa este arquivo dinamicamente, só
 * quando a seção se aproxima da viewport. O GSAP (~135 KB) sai do bundle
 * inicial da home e do blog e passa a ser baixado depois da hidratação.
 */
export function runAnimation(animation: string, container: HTMLDivElement) {
  const [page, section] = animation.split("/");

  const pages: Record<string, Wrapper | undefined> = animations;
  const sectionFn = pages[page]?.[section];

  if (typeof sectionFn !== "function") return () => {};

  const ctx = gsap.context(() => sectionFn(container), container);

  return () => ctx.revert();
}

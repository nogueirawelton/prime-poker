import { Icon } from "./icon";

/**
 * Abertura de marca da home.
 *
 * Totalmente em CSS e sem `"use client"`: antes o overlay era um
 * `AnimationContainer` e só saía da frente quando o GSAP terminava a
 * timeline — perto de 3s de tela preta, com o LCP refém do download da
 * biblioteca. Agora os keyframes rodam no primeiro frame e o overlay se
 * remove sozinho, independente de JS.
 *
 * `pointer-events-none` já no HTML: a animação termina em `display: none`,
 * mas até lá o overlay não pode roubar clique do banner.
 */
export function Loading() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] grid animate-intro-overlay place-items-center overflow-hidden bg-prime-dark"
    >
      <Icon />
    </div>
  );
}

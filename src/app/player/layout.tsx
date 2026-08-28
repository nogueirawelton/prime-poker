import type { Metadata } from "next";
import { PlayerHeader } from "@/components/shared/player/player-header";

export const metadata: Metadata = {
  // Área logada nunca deve ser indexada.
  robots: { index: false, follow: false },
};

/**
 * Chrome da área logada. De propósito NÃO inclui:
 * - `SmootherProvider` (Lenis): inércia atrapalha formulários e listas;
 * - o overlay de `Loading` com GSAP: é abertura de landing page;
 * - o Footer institucional.
 */
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PlayerHeader />

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}

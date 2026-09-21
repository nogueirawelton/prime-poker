import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsProvider } from "@/components/shared/player/notifications-provider";
import { PlayerHeader } from "@/components/shared/player/player-header";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  // Área logada nunca deve ser indexada.
  robots: { index: false, follow: false },
};

/**
 * Chrome e guarda da área do jogador.
 *
 * De propósito NÃO inclui:
 * - `SmootherProvider` (Lenis): inércia atrapalha formulários e listas;
 * - o overlay de `Loading` com GSAP: é abertura de landing page;
 * - o Footer institucional.
 *
 * O `<main>` não impõe container: a listagem de aulas ocupa a largura toda
 * para encostar a sidebar na borda esquerda. Cada página cuida do próprio
 * espaçamento.
 *
 * A leitura da sessão fica DENTRO de um boundary de Suspense, e não no topo do
 * layout: sob Cache Components, um `await` de sessão no topo prende o segmento
 * inteiro atrás da requisição e derruba o prerender do shell estático.
 *
 * Este guard é defesa em profundidade, não a barreira principal: quem barra de
 * fato é o proxy, que roda ANTES de qualquer renderização e consegue responder
 * 307. Aqui, depois que o shell é transmitido, o `redirect()` só chega como
 * instrução no corpo — com o HTML da página já entregue junto.
 */
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Guard>
        {/* Envolve header e página: o sino e a lista de notificações
            precisam concordar sobre o que já foi lido. */}
        <NotificationsProvider>
          <div className="flex min-h-screen flex-col">
            <PlayerHeader />

            <main className="flex w-full flex-1 flex-col">{children}</main>
          </div>
        </NotificationsProvider>
      </Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  await requireSession();

  return children;
}

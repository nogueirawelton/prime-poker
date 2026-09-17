import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NotificationBellData } from "./notification-bell-server";
import { PlayerMenu } from "./player-menu";
import { PlayerMenuData } from "./player-menu-server";

/**
 * Header da área logada.
 *
 * Grudado no topo (`sticky`), sem âncoras de scroll e sem o auto-hide da
 * landing. Navegação, perfil e saída ficam todos no menu da direita.
 */
export function PlayerHeader() {
  return (
    <header className="sticky top-0 z-40 border-white/10 border-b bg-prime-dark">
      <div className="flex h-20 items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/player" className="shrink-0">
          <Image
            src="/img/logo.svg"
            width={90}
            height={80}
            alt="Prime Poker Team"
            className="h-[52px] w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* As notificações são por usuário: ficam atrás do próprio
              boundary para não segurar o shell estático do header. */}
          <Suspense fallback={<div className="size-10" />}>
            <NotificationBellData />
          </Suspense>

          {/* Mesmo motivo do sino: o nome é do usuário. O fallback já é o
              menu funcional, só sem o nome. */}
          <Suspense fallback={<PlayerMenu />}>
            <PlayerMenuData />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

import { SignOutIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

/**
 * Header da área logada: fixo apenas no topo do fluxo (sem `fixed`), sem
 * âncoras de scroll e sem o comportamento de auto-hide da landing.
 */
export function PlayerHeader() {
  return (
    <header className="border-white/10 border-b bg-prime-dark">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/player">
          <Image
            src="/img/logo.svg"
            width={90}
            height={80}
            alt="Prime Poker Team"
            className="h-[52px] w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* TODO: trocar pelo nome/avatar do usuário quando houver sessão. */}
          <span className="flex items-center gap-2 text-prime-light text-sm">
            <UserIcon className="size-5" weight="bold" />
            <span className="hidden sm:inline">Minha conta</span>
          </span>

          {/* TODO: ligar à ação de logout. */}
          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-md border border-white/20 px-4 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
          >
            <SignOutIcon className="size-4" weight="bold" />
            Sair
          </Link>
        </div>
      </div>
    </header>
  );
}

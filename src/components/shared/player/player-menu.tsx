"use client";

import {
  BellIcon,
  CaretDownIcon,
  CircleNotchIcon,
  type Icon,
  PlayCircleIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { logout } from "@/actions/auth";
import { initials } from "@/utils/initials";

const LINKS = [
  { href: "/player/aulas", label: "Aulas", icon: PlayCircleIcon },
  { href: "/player/notificacoes", label: "Notificações", icon: BellIcon },
  { href: "/player", label: "Meu perfil", icon: UserIcon },
] as const;

/**
 * Menu único da área logada: navegação, perfil e saída.
 *
 * A navegação mora aqui em vez de uma barra no header — são poucas rotas e o
 * header fica livre para o conteúdo da página.
 *
 * `/player` só fica ativo em correspondência exata: sendo prefixo de todas as
 * outras rotas, ele acenderia junto com elas.
 *
 * Sem `name`, é o estado de carregamento: o fallback do Suspense no header
 * renderiza o menu já funcional enquanto o perfil chega do WordPress.
 */
export function PlayerMenu({
  name,
  tier,
}: {
  name?: string;
  tier?: string | null;
}) {
  const pathname = usePathname();
  const [loggingOut, startLogout] = useTransition();

  return (
    <DropdownMenu.Root>
      {/* O menu fecha ao clicar em "Sair" e desmonta o conteúdo: o feedback
          precisa morar fora dele. A transição segue pendente até a navegação
          para a home terminar. */}
      {loggingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-60 flex items-center justify-center gap-3 bg-prime-dark/80 font-semibold text-prime-light text-sm uppercase backdrop-blur-sm"
        >
          <CircleNotchIcon className="size-6 animate-spin text-prime-red" />
          Saindo…
        </div>
      )}

      <DropdownMenu.Trigger
        disabled={loggingOut}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-500 hover:bg-white/5 disabled:opacity-60"
      >
        <span className="hidden flex-col items-end sm:flex">
          <span className="max-w-40 truncate font-semibold text-prime-light text-sm">
            {name ?? "Minha conta"}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-prime-light/50">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {tier ?? "Online"}
          </span>
        </span>

        <span className="flex size-10 items-center justify-center rounded-full bg-white/10 font-bold text-prime-light text-sm">
          {name ? (
            initials(name)
          ) : (
            <UserIcon className="size-5" weight="bold" />
          )}
        </span>

        <CaretDownIcon
          className="size-4 text-prime-light/50"
          weight="bold"
          aria-hidden="true"
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-white/10 bg-zinc-800 p-2 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
        >
          {LINKS.map(({ href, label, icon }) => (
            <Item
              key={href}
              href={href}
              icon={icon}
              active={
                href === "/player"
                  ? pathname === "/player" || pathname === "/player/"
                  : pathname.startsWith(href)
              }
            >
              {label}
            </Item>
          ))}

          <DropdownMenu.Separator className="my-2 h-px bg-white/10" />

          {/* Server Action, não link: encerrar sessão muda estado e sai como
              POST. Como link, o prefetch do Next poderia derrubar a sessão de
              quem só passasse o mouse por cima. */}
          <DropdownMenu.Item
            disabled={loggingOut}
            onSelect={() => startLogout(() => logout())}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-prime-light/80 text-sm outline-none transition-colors duration-300 data-highlighted:bg-prime-red/15 data-highlighted:text-prime-red"
          >
            <SignOutIcon className="size-4" weight="bold" />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  href,
  icon: ItemIcon,
  active,
  children,
}: {
  href: string;
  icon: Icon;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={twMerge(
          "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-300 data-highlighted:bg-white/5",
          active
            ? "font-semibold text-prime-red"
            : "text-prime-light/80 data-highlighted:text-prime-light",
        )}
      >
        <ItemIcon className="size-4" weight={active ? "fill" : "bold"} />
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}

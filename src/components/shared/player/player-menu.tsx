"use client";

import {
  BellIcon,
  CaretDownIcon,
  type Icon,
  PlayCircleIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { twMerge } from "tailwind-merge";
import { logout } from "@/actions/auth";
import { iniciais } from "@/utils/iniciais";

const LINKS = [
  { href: "/player/aulas", label: "Aulas", icone: PlayCircleIcon },
  { href: "/player/notificacoes", label: "Notificações", icone: BellIcon },
  { href: "/player", label: "Meu perfil", icone: UserIcon },
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
 * Sem `nome`, é o estado de carregamento: o fallback do Suspense no header
 * renderiza o menu já funcional enquanto o perfil chega do WordPress.
 */
export function PlayerMenu({
  nome,
  tier,
}: {
  nome?: string;
  tier?: string | null;
}) {
  const pathname = usePathname();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-500 hover:bg-white/5">
        <span className="hidden flex-col items-end sm:flex">
          <span className="max-w-40 truncate font-semibold text-prime-light text-sm">
            {nome ?? "Minha conta"}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-prime-light/50">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {tier ?? "Online"}
          </span>
        </span>

        <span className="flex size-10 items-center justify-center rounded-full bg-white/10 font-bold text-prime-light text-sm">
          {nome ? (
            iniciais(nome)
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
          className="z-50 w-56 rounded-xl border border-white/10 bg-prime-darkgray p-2 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
        >
          {LINKS.map(({ href, label, icone }) => (
            <Item
              key={href}
              href={href}
              icone={icone}
              ativo={
                href === "/player"
                  ? pathname === "/player" || pathname === "/player/"
                  : pathname.startsWith(href)
              }
            >
              {label}
            </Item>
          ))}

          <DropdownMenu.Separator className="my-2 h-px bg-white/10" />

          {/* Formulário, não link: encerrar sessão muda estado e precisa ser
              POST. Como link, o prefetch do Next poderia derrubar a sessão de
              quem só passasse o mouse por cima. */}
          <form action={logout}>
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-prime-light/80 text-sm outline-none transition-colors duration-300 data-highlighted:bg-prime-red/15 data-highlighted:text-prime-red"
              >
                <SignOutIcon className="size-4" weight="bold" />
                Sair
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  href,
  icone: Icone,
  ativo,
  children,
}: {
  href: string;
  icone: Icon;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        aria-current={ativo ? "page" : undefined}
        className={twMerge(
          "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-300 data-highlighted:bg-white/5",
          ativo
            ? "font-semibold text-prime-red"
            : "text-prime-light/80 data-highlighted:text-prime-light",
        )}
      >
        <Icone className="size-4" weight={ativo ? "fill" : "bold"} />
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}

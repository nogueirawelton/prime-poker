"use client";

// TODO: reativar junto com o botão "Entrar" (área logada oculta na master).
// import { UserIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { type ReactNode, useRef, useState } from "react";
import { useSmoother } from "@/hooks/use-smoother";

/** Âncoras da home: interceptadas para rolar com o Lenis. */
const ANCHORS = [
  { href: "#quem-somos", label: "Quem Somos" },
  { href: "#o-que-fazemos", label: "O que Fazemos" },
  { href: "#head-coaches", label: "Head Coaches" },
  { href: "#instrutores", label: "Instrutores" },
  { href: "#evolucao", label: "Evolução" },
  { href: "#faca-parte", label: "Faça parte" },
];

/** Rotas reais: navegam normalmente, sem preventDefault. */
// Blog oculto na master — reativar quando for ao ar.
// const ROUTES = [{ href: "/blog", label: "Blog" }];
const ROUTES: { href: string; label: string }[] = [];

/**
 * O painel do menu mobile.
 *
 * Módulo separado do gatilho porque é aqui que entra o Radix Dialog. No
 * mobile — exatamente onde o PageSpeed mede — ninguém deveria baixar o menu
 * inteiro só para ver o ícone de hambúrguer.
 *
 * Nasce aberto: só é montado depois do toque.
 */
export function MenuMobileDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const { scrollTo } = useSmoother();

  // O Radix trava o scroll do body enquanto o dialog está aberto. Guardamos o
  // destino e só rolamos depois do fechamento, quando a trava é liberada.
  const pendingTarget = useRef<string | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />

        <Dialog.Content
          onCloseAutoFocus={() => {
            if (!pendingTarget.current) return;

            const target = pendingTarget.current;
            pendingTarget.current = null;
            scrollTo(target);
          }}
          className="fixed inset-0 top-0 z-50 flex flex-col overflow-scroll bg-prime-dark data-[state=closed]:animate-to-top data-[state=open]:animate-to-bottom lg:hidden"
        >
          <Dialog.DialogTitle className="sr-only">
            Menu Mobile
          </Dialog.DialogTitle>

          <div className="flex h-24 w-full items-center justify-between px-4 lg:px-8">
            <Dialog.Close asChild>
              <Link href={"/"} className="lg:h-full">
                <Image
                  src="/img/logo.svg"
                  width={190}
                  height={50}
                  alt="Prime Poker Logo"
                />
              </Link>
            </Dialog.Close>

            <Dialog.Close aria-label="Fechar menu">
              <XIcon aria-hidden="true" className="size-7 text-prime-light" />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col justify-center border-t px-4">
            <nav className="flex flex-col items-center gap-6 font-semibold text-md text-prime-light uppercase [&_a]:transition-all [&_a]:duration-500 [&_a]:hover:text-prime-red">
              {ANCHORS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => {
                    event.preventDefault();
                    pendingTarget.current = href;
                    setOpen(false);
                  }}
                >
                  {label}
                </Link>
              ))}

              {ROUTES.map(({ href, label }) => (
                <Dialog.Close asChild key={href}>
                  <Link href={href}>{label}</Link>
                </Dialog.Close>
              ))}
            </nav>

            {/* Área logada oculta na master — reativar quando for ao ar. */}
            {/* <Dialog.Close asChild>
              <Link
                href="/login"
                className="mt-10 flex h-14 items-center justify-center gap-2 rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
              >
                <UserIcon className="size-5" weight="bold" />
                Entrar
              </Link>
            </Dialog.Close> */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

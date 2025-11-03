"use client";

import { Scroller } from "@/hooks/use-smoother/scroller";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

export function MenuMobileTrigger({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />

        <Dialog.Content className="data-[state=open]:animate-to-bottom bg-prime-dark fixed inset-0 top-0 z-50 flex flex-col overflow-scroll lg:hidden">
          <Dialog.DialogTitle className="sr-only">
            Menu Mobile
          </Dialog.DialogTitle>

          <div className="flex h-24 w-full items-center justify-between px-4 lg:px-8">
            <Dialog.Close asChild>
              <Link href={"/"} className="lg:h-full">
                <Image
                  src="/img/logo.svg"
                  width={90}
                  height={80}
                  alt="Prime Poker Logo"
                  className="h-[70px] w-auto lg:h-full"
                />
              </Link>
            </Dialog.Close>

            <Dialog.Close>
              <XIcon className="text-prime-light size-7" />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col justify-center border-t px-4">
            <nav className="[&_a]:hover:text-prime-red text-prime-light text-md flex flex-col items-center gap-6 font-semibold uppercase [&_a]:transition-all [&_a]:duration-500">
              <span onClick={() => setOpen(false)}>
                <Scroller href="#quem-somos">Quem Somos</Scroller>
              </span>

              <span onClick={() => setOpen(false)}>
                <Scroller href="#o-que-fazemos">O que Fazemos</Scroller>
              </span>

              <span onClick={() => setOpen(false)}>
                <Scroller href="#head-coachs">Head Coachs</Scroller>
              </span>

              <span onClick={() => setOpen(false)}>
                <Scroller href="#instrutores">Instrutores</Scroller>
              </span>

              <span onClick={() => setOpen(false)}>
                <Scroller href="#evolucao">Evolução</Scroller>
              </span>

              <span onClick={() => setOpen(false)}>
                <Scroller href="#faca-parte">Faça parte</Scroller>
              </span>
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

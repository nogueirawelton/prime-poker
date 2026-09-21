"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { Form } from "@/components/shared/application-form";

/**
 * O diálogo de verdade. Vive num módulo separado porque é aqui que entram
 * Radix Dialog + Tabs, react-hook-form, zod e o input de telefone — perto de
 * 400 KB que não podem estar no carregamento inicial da home.
 *
 * Nasce aberto: só é montado depois que o visitante clica no gatilho.
 */
export function ApplicationDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 mt-8 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-md border border-prime-red/75 bg-zinc-950 px-6 py-8 data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open">
          <Dialog.Title className="sr-only">Formulário</Dialog.Title>

          <Form />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

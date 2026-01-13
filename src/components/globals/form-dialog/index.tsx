import { Dialog } from "radix-ui";
import { ReactNode } from "react";
import { Form } from "./form";

export function FormDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <Dialog.Content className="border-prime-red/75 fixed top-1/2 left-1/2 z-50 mt-8 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-md border bg-zinc-950 px-6 py-8">
          <Dialog.Title className="sr-only">Formulário</Dialog.Title>

          <Form />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

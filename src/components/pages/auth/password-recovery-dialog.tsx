"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleNotchIcon,
  EnvelopeSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { requestPasswordReset } from "@/actions/auth";
import { IconInput } from "@/components/ui/form/icon-input";

const recoverySchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

type RecoveryData = z.infer<typeof recoverySchema>;

export function PasswordRecoveryDialog({ children }: { children: ReactNode }) {
  const emailId = useId();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryData>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<RecoveryData> = async ({ email }) => {
    try {
      const result = await requestPasswordReset(email);

      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível enviar.");
        return;
      }

      // Mensagem propositalmente neutra: confirmar se um e-mail existe na base
      // permite enumerar contas cadastradas.
      toast.success(
        "Se houver uma conta com esse e-mail, enviaremos as instruções.",
      );

      reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível enviar. Tente novamente.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-zinc-800 p-6 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-black text-prime-light text-xl uppercase">
                Recuperar senha
              </Dialog.Title>

              <Dialog.Description className="mt-1 text-prime-light/70 text-sm">
                Informe seu e-mail e enviaremos as instruções para criar uma
                nova senha.
              </Dialog.Description>
            </div>

            <Dialog.Close
              aria-label="Fechar"
              className="shrink-0 text-prime-light/70 transition-colors duration-500 hover:text-prime-light"
            >
              <XIcon className="size-5" />
            </Dialog.Close>
          </div>

          {/* `noValidate`: a validação nativa do HTML5 bloquearia o submit
              antes do schema rodar, mostrando o balão do navegador. */}
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailId}
                className="font-semibold text-prime-light text-sm"
              >
                E-mail
              </label>

              <IconInput
                id={emailId}
                icon={EnvelopeSimpleIcon}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="grid h-14 place-items-center rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-70"
            >
              {isSubmitting ? (
                <CircleNotchIcon className="size-6 animate-spin" />
              ) : (
                "Enviar instruções"
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

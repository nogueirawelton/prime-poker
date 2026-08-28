"use client";

import { XIcon } from "@phosphor-icons/react";
import { Dialog, Switch } from "radix-ui";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import {
  CONSENT_ALL_DENIED,
  CONSENT_ALL_GRANTED,
  CONSENT_CATEGORIES,
  type ConsentValue,
} from "./config";
import { useConsent } from "./consent-provider";

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-prime-red" : "bg-white/20",
        disabled && "opacity-60",
      )}
    >
      <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-prime-light shadow-sm transition-transform data-[state=checked]:translate-x-[22px]" />
    </Switch.Root>
  );
}

export function PreferencesDialog() {
  const { consent, preferencesOpen, setPreferencesOpen, save } = useConsent();

  const [draft, setDraft] = useState<ConsentValue>(
    consent ?? CONSENT_ALL_DENIED,
  );

  // Ao abrir, parte da escolha atual (ou tudo desligado se ainda não decidiu).
  useEffect(() => {
    if (preferencesOpen) setDraft(consent ?? CONSENT_ALL_DENIED);
  }, [preferencesOpen, consent]);

  return (
    <Dialog.Root open={preferencesOpen} onOpenChange={setPreferencesOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open">
          <div className="flex items-start justify-between gap-4 border-white/10 border-b p-6">
            <div>
              <Dialog.Title className="font-black text-prime-light text-xl uppercase">
                Preferências de cookies
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-prime-light/70 text-sm">
                Escolha quais categorias de cookies você autoriza. Você pode
                mudar isso quando quiser.
              </Dialog.Description>
            </div>
            <Dialog.Close className="shrink-0 text-prime-light/70 transition-colors duration-500 hover:text-prime-light">
              <XIcon className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 divide-y divide-white/10 overflow-y-auto px-6 text-prime-light">
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-bold text-sm">Necessários</p>
                <p className="text-prime-light/70 text-sm">
                  Essenciais para o funcionamento do site. Sempre ativos.
                </p>
              </div>
              <Toggle checked disabled />
            </div>

            {CONSENT_CATEGORIES.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-bold text-sm">{category.title}</p>
                  <p className="text-prime-light/70 text-sm">
                    {category.description}
                  </p>
                </div>
                <Toggle
                  checked={draft[category.key]}
                  onChange={(value) =>
                    setDraft((prev) => ({ ...prev, [category.key]: value }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-white/10 border-t p-6 sm:flex-row">
            <button
              type="button"
              onClick={() => save(CONSENT_ALL_DENIED)}
              className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-500 hover:bg-prime-light hover:text-prime-dark"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => save(draft)}
              className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-500 hover:bg-prime-light hover:text-prime-dark"
            >
              Salvar escolhas
            </button>
            <button
              type="button"
              onClick={() => save(CONSENT_ALL_GRANTED)}
              className="flex-1 rounded-lg bg-prime-red px-4 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-500 hover:bg-prime-light hover:text-prime-red"
            >
              Aceitar todos
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useRef } from "react";
import { type QuestionState, sendQuestion } from "@/actions/lesson";

/** Envio de dúvida ao instrutor. */
export function QuestionForm({
  slug,
  instructor,
}: {
  slug: string;
  instructor: string;
}) {
  const form = useRef<HTMLFormElement>(null);

  // `bind` leva o slug ao servidor sem um campo escondido no formulário —
  // um input hidden seria editável pelo cliente.
  const [state, action, pending] = useActionState<QuestionState, FormData>(
    sendQuestion.bind(null, slug),
    {},
  );

  useEffect(() => {
    // Limpa só quando o envio deu certo; com erro, o texto continua ali.
    if (!pending && !state.error) form.current?.reset();
  }, [pending, state]);

  return (
    <form ref={form} action={action} className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <label htmlFor={`duvida-${slug}`} className="sr-only">
          Sua dúvida para {instructor}
        </label>

        {/* `input`, e não `textarea`: a altura fica travada na do botão de
            enviar e o campo não ganha barra de rolagem quando o texto passa
            da largura. De brinde, Enter envia. */}
        <input
          id={`duvida-${slug}`}
          type="text"
          name="text"
          maxLength={2000}
          placeholder={`Digite sua dúvida para ${instructor}...`}
          aria-invalid={Boolean(state.error)}
          className="h-12 flex-1 rounded-xl border border-white/10 bg-white/3 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
        />

        <button
          type="submit"
          disabled={pending}
          aria-label="Enviar dúvida"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-prime-red text-prime-light transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
        >
          {pending ? (
            <SpinnerGapIcon className="size-5 animate-spin" />
          ) : (
            <PaperPlaneRightIcon className="size-5" weight="fill" />
          )}
        </button>
      </div>

      {state.error && (
        <small role="alert" className="text-prime-red text-xs">
          {state.error}
        </small>
      )}
    </form>
  );
}

"use client";

import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useRef } from "react";
import { type QuestionState, sendQuestion } from "@/actions/lesson";

/**
 * Envio de dúvida ao instrutor.
 *
 * Sem `parentId`, abre uma dúvida nova no fim da lista; com ele, a mensagem
 * entra como resposta dentro daquela conversa.
 */
export function QuestionForm({
  lessonId,
  instructor,
  parentId,
  autoFocus,
  onSent,
}: {
  lessonId: number;
  instructor: string;
  parentId?: number;
  autoFocus?: boolean;
  onSent?: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // O campo de resposta nasce escondido e só aparece quando o jogador clica
  // em "Responder": levar o cursor até ele é o passo seguinte do gesto, não
  // um foco roubado na abertura da página.
  useEffect(() => {
    if (autoFocus) field.current?.focus();
  }, [autoFocus]);

  // `bind` leva a aula ao servidor sem um campo escondido no formulário —
  // um input hidden seria editável pelo cliente.
  const [state, action, pending] = useActionState<QuestionState, FormData>(
    sendQuestion.bind(null, lessonId, parentId),
    {},
  );

  // Só depois de um envio de verdade: na montagem o formulário já está
  // parado e sem erro, e sem esta marca o campo de resposta se fecharia
  // sozinho no instante em que aparecesse.
  const submitted = useRef(false);

  useEffect(() => {
    if (pending) {
      submitted.current = true;

      return;
    }

    if (!submitted.current) return;

    submitted.current = false;

    // Limpa só quando o envio deu certo; com erro, o texto continua ali.
    if (state.error) return;

    form.current?.reset();
    onSent?.();
  }, [pending, state, onSent]);

  return (
    <form ref={form} action={action} className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <label
          htmlFor={`duvida-${lessonId}-${parentId ?? 0}`}
          className="sr-only"
        >
          {parentId ? "Sua resposta" : `Sua dúvida para ${instructor}`}
        </label>

        {/* `input`, e não `textarea`: a altura fica travada na do botão de
            enviar e o campo não ganha barra de rolagem quando o texto passa
            da largura. De brinde, Enter envia. */}
        <input
          id={`duvida-${lessonId}-${parentId ?? 0}`}
          type="text"
          name="text"
          maxLength={2000}
          ref={field}
          placeholder={
            parentId
              ? "Escreva sua resposta..."
              : `Digite sua dúvida para ${instructor}...`
          }
          aria-invalid={Boolean(state.error)}
          className="h-12 flex-1 rounded-xl border border-white/10 bg-white/3 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
        />

        <button
          type="submit"
          disabled={pending}
          aria-label={parentId ? "Enviar resposta" : "Enviar dúvida"}
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

"use client";

import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useQuestions } from "./questions-provider";

/**
 * Envio de dúvida ao instrutor.
 *
 * Sem `parentId`, abre uma dúvida nova no fim da lista; com ele, a mensagem
 * entra como resposta dentro daquela conversa.
 *
 * O envio não trava o formulário: o campo se limpa no clique e a mensagem
 * já aparece na conversa (ver `QuestionsProvider`). Se a gravação falhar, o
 * texto volta para o campo — desde que o jogador não tenha começado outro.
 */
export function QuestionForm({
  lessonId,
  instructor,
  parentId,
  threadId,
  autoFocus,
  onSent,
}: {
  lessonId: number;
  instructor: string;
  parentId?: number;
  /** Conversa onde a resposta aparece enquanto está a caminho. */
  threadId?: string;
  autoFocus?: boolean;
  onSent?: () => void;
}) {
  const field = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const { send } = useQuestions();

  // O campo de resposta nasce escondido e só aparece quando o jogador clica
  // em "Responder": levar o cursor até ele é o passo seguinte do gesto, não
  // um foco roubado na abertura da página.
  useEffect(() => {
    if (autoFocus) field.current?.focus();
  }, [autoFocus]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = field.current?.value.trim() ?? "";

    // O servidor valida de novo; aqui é só para não mandar o vazio.
    if (!text) {
      setError("Escreva sua dúvida antes de enviar.");

      return;
    }

    setError(undefined);
    event.currentTarget.reset();
    onSent?.();

    const result = await send({ text, parentId, threadId });

    if (result.error && field.current && !field.current.value) {
      field.current.value = text;
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
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
          aria-invalid={Boolean(error)}
          onChange={() => error && setError(undefined)}
          className="h-12 flex-1 rounded-xl border border-white/10 bg-white/3 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
        />

        <button
          type="submit"
          aria-label={parentId ? "Enviar resposta" : "Enviar dúvida"}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-prime-red text-prime-light transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
        >
          <PaperPlaneRightIcon className="size-5" weight="fill" />
        </button>
      </div>

      {error && (
        <small role="alert" className="text-prime-red text-xs">
          {error}
        </small>
      )}
    </form>
  );
}

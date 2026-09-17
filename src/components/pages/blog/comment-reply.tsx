"use client";

import { ArrowBendUpLeftIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { CommentForm } from "./comment-form";

/** Botão "Responder" com o formulário embutido, aberto sob demanda. */
export function CommentReply({
  postId,
  parentId,
}: {
  postId: number;
  parentId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex items-center gap-1.5 text-prime-light/50 text-xs transition-colors duration-300 hover:text-prime-red"
      >
        <ArrowBendUpLeftIcon className="size-4" weight="bold" />
        Responder
      </button>
    );
  }

  return (
    <div className="mt-2">
      <CommentForm
        postId={postId}
        parentId={parentId}
        compact
        // Fecha sozinho depois do envio: a confirmação já apareceu no lugar
        // do formulário e a resposta entra na lista na próxima visita.
        onSubmitted={() => setTimeout(() => setIsOpen(false), 4000)}
      />

      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="mt-2 text-prime-light/40 text-xs underline underline-offset-2 transition-colors duration-300 hover:text-prime-light"
      >
        Cancelar
      </button>
    </div>
  );
}

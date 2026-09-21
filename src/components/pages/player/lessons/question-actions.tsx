"use client";

import { ArrowBendUpLeftIcon, HeartIcon } from "@phosphor-icons/react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
import { likeQuestion } from "@/actions/lesson";
import { QuestionForm } from "./question-form";

/**
 * Curtir e responder, debaixo de cada mensagem.
 *
 * Curtir vale para qualquer mensagem, pergunta ou resposta — desde que o
 * jogador tenha acesso à aula. Em aula trancada a conversa aparece, porque
 * faz parte do convite ao upgrade, mas ele não participa dela.
 *
 * Responder só aparece onde continua a conversa: na resposta do instrutor a
 * uma dúvida que é do próprio jogador (ver `canAnswer` em `questions.tsx`).
 *
 * Curtir muda coração e contagem no clique; a action grava em segundo plano
 * e o `refresh()` dela traz o número de verdade. Se falhar, o otimista
 * expira sozinho e um toast avisa.
 */
export function QuestionActions({
  lessonId,
  commentId,
  likes,
  liked,
  instructor,
  canAnswer,
  canLike,
  threadId,
}: {
  lessonId: number;
  commentId: number;
  likes: number;
  liked: boolean;
  instructor: string;
  /** Só na resposta do instrutor a uma dúvida do próprio jogador. */
  canAnswer: boolean;
  /** Falso em aula trancada: o servidor recusaria de qualquer forma. */
  canLike: boolean;
  /** Conversa onde a resposta aparece enquanto está a caminho. */
  threadId?: string;
}) {
  const [, startTransition] = useTransition();
  const [answering, setAnswering] = useState(false);
  const [like, setLike] = useOptimistic({ liked, likes });

  function toggleLike() {
    // Parte do otimista, e não da prop: dois cliques seguidos descurtem.
    const next = {
      liked: !like.liked,
      likes: Math.max(0, like.likes + (like.liked ? -1 : 1)),
    };

    startTransition(async () => {
      setLike(next);

      const result = await likeQuestion(commentId);

      if ("error" in result) toast.error(result.error);
    });
  }

  // Sem nada a oferecer, nem a linha aparece — uma tira vazia de 2rem
  // embaixo de cada mensagem só faria a conversa respirar errado.
  if (!canLike && !canAnswer) return null;

  return (
    <div className="mt-2 flex flex-col gap-3 pl-12">
      <div className="flex items-center gap-4">
        {canLike && (
          <button
            type="button"
            aria-pressed={like.liked}
            onClick={toggleLike}
            className={twMerge(
              "flex items-center gap-1.5 text-xs transition-colors duration-300",
              like.liked
                ? "font-semibold text-prime-red"
                : "text-prime-light/50 hover:text-prime-light",
            )}
          >
            <HeartIcon
              className="size-4"
              weight={like.liked ? "fill" : "regular"}
            />
            {like.liked ? "Curtido" : "Curtir"}
            {like.likes > 0 && (
              <span className="tabular-nums">({like.likes})</span>
            )}
          </button>
        )}

        {canAnswer && (
          <button
            type="button"
            onClick={() => setAnswering((open) => !open)}
            aria-expanded={answering}
            className="flex items-center gap-1.5 text-prime-light/50 text-xs transition-colors duration-300 hover:text-prime-light"
          >
            <ArrowBendUpLeftIcon className="size-4" />
            Responder
          </button>
        )}
      </div>

      {answering && (
        <QuestionForm
          lessonId={lessonId}
          instructor={instructor}
          parentId={commentId}
          threadId={threadId}
          autoFocus
          onSent={() => setAnswering(false)}
        />
      )}
    </div>
  );
}

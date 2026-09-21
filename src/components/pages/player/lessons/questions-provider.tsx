"use client";

import {
  createContext,
  use,
  useOptimistic,
  useRef,
  useTransition,
} from "react";
import { toast } from "react-toastify";
import { type QuestionState, sendQuestion } from "@/actions/lesson";
import { Message } from "./message";

/** Uma mensagem que já está na tela e ainda não chegou ao WordPress. */
type Pending = {
  key: string;
  /** Conversa onde ela aparece; `undefined` é uma dúvida nova. */
  threadId?: string;
  text: string;
  data: string;
};

type Send = (input: {
  text: string;
  /** Comentário a que a mensagem responde, no WordPress. */
  parentId?: number;
  threadId?: string;
}) => Promise<QuestionState>;

const QuestionsContext = createContext<{
  pending: Array<Pending>;
  me: { name: string; avatarUrl: string | null };
  send: Send;
} | null>(null);

/**
 * Envio de dúvidas sem espera.
 *
 * A mensagem entra na conversa no clique, esmaecida, e a action corre em
 * segundo plano. Ela chama `refresh()`: quando a transição termina, a lista
 * do servidor já traz a mensagem de verdade e a otimista sai de cena no
 * mesmo quadro — sem pulo. Se a gravação falha, a otimista some sozinha e
 * um toast avisa.
 */
export function QuestionsProvider({
  lessonId,
  me,
  children,
}: {
  lessonId: number;
  me: { name: string; avatarUrl: string | null };
  children: React.ReactNode;
}) {
  const [pending, addPending] = useOptimistic<Array<Pending>, Pending>(
    [],
    (current, item) => [...current, item],
  );
  const [, startTransition] = useTransition();
  const sequence = useRef(0);

  const send: Send = ({ text, parentId, threadId }) =>
    new Promise((resolve) => {
      sequence.current += 1;

      startTransition(async () => {
        addPending({
          key: `enviando-${sequence.current}`,
          threadId,
          text,
          data: new Date().toISOString(),
        });

        const result = await sendQuestion(lessonId, parentId, text);

        if (result.error) toast.error(result.error);

        resolve(result);
      });
    });

  return (
    <QuestionsContext value={{ pending, me, send }}>
      {children}
    </QuestionsContext>
  );
}

export function useQuestions() {
  const context = use(QuestionsContext);

  if (!context) {
    throw new Error("useQuestions precisa estar dentro de QuestionsProvider");
  }

  return context;
}

/**
 * As mensagens a caminho de uma conversa, no fim dela.
 *
 * `empty` aparece só quando não há nada a caminho: a primeira dúvida da aula
 * substitui o "nenhuma dúvida ainda" no mesmo clique.
 */
export function PendingMessages({
  threadId,
  empty,
}: {
  threadId?: string;
  empty?: React.ReactNode;
}) {
  const { pending, me } = useQuestions();
  const items = pending.filter((item) => item.threadId === threadId);

  if (items.length === 0) return empty ?? null;

  const list = items.map((item) => (
    <li key={item.key}>
      <Message
        sending
        message={{
          id: item.key,
          author: me.name,
          avatarUrl: me.avatarUrl,
          isInstructor: false,
          text: item.text,
          data: item.data,
          replies: [],
          isMine: true,
          likes: 0,
          liked: false,
        }}
      />
    </li>
  ));

  // Sem `empty`, quem chama já está dentro de uma lista.
  return empty === undefined ? (
    list
  ) : (
    <ol className="flex flex-col gap-6">{list}</ol>
  );
}

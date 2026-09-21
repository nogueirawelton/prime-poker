import type { Question } from "@/services/lesson-detail";
import { Message } from "./message";
import { QuestionActions } from "./question-actions";
import { QuestionForm } from "./question-form";
import { PendingMessages, QuestionsProvider } from "./questions-provider";

/**
 * Conversa com o instrutor da aula.
 *
 * Uma seção só, sem abas: a dúvida vai para quem dá a aula, e a resposta
 * chega no mesmo lugar.
 *
 * O que o jogador envia entra na conversa no mesmo instante, esmaecido,
 * enquanto a gravação corre em segundo plano (`QuestionsProvider`).
 */
export function Questions({
  lessonId,
  questions,
  instructor,
  canAsk,
  me,
}: {
  lessonId: number;
  questions: Array<Question>;
  instructor: string;
  /** Quem está logado: assina a mensagem enquanto ela ainda está indo. */
  me: { name: string; avatarUrl: string | null };
  /** Aula trancada não recebe pergunta: o plugin recusa, e com razão. */
  canAsk: boolean;
}) {
  // Aula sem instrutor cadastrado ainda recebe dúvidas — quem responde é a
  // equipe de qualquer forma.
  const target = instructor || "o instrutor";

  return (
    <QuestionsProvider lessonId={lessonId} me={me}>
      <div className="flex flex-col gap-6">
        {questions.length === 0 ? (
          <PendingMessages
            empty={
              <p className="py-6 text-center text-prime-light/50 text-sm">
                Nenhuma dúvida ainda. Pergunte a {target}.
              </p>
            }
          />
        ) : (
          // Lista corrida, sem caixas: o que amarra a resposta à pergunta é o
          // recuo dela, e não uma moldura em volta de cada conversa.
          <ol className="flex flex-col gap-6">
            {questions.map((question) => (
              <li key={question.id}>
                <Message message={question} />

                <QuestionActions
                  lessonId={lessonId}
                  commentId={Number(question.id)}
                  likes={question.likes}
                  liked={question.liked}
                  instructor={target}
                  canAnswer={false}
                  canLike={canAsk}
                />

                {question.replies.length > 0 && (
                  // `ml-4` alinha a linha com o meio do avatar da pergunta.
                  <ol className="mt-4 ml-4 flex flex-col gap-4 border-white/10 border-l-2 pl-5">
                    {question.replies.map((reply) => (
                      <li key={reply.id}>
                        <Message message={reply} />

                        <QuestionActions
                          lessonId={lessonId}
                          commentId={Number(reply.id)}
                          likes={reply.likes}
                          liked={reply.liked}
                          instructor={target}
                          // Responder continua a SUA dúvida: aparece na
                          // resposta do instrutor, na conversa que você abriu.
                          // Nas dúvidas dos outros dá para curtir, não
                          // conversar — quem quer perguntar abre a sua.
                          canAnswer={
                            canAsk && reply.isInstructor && question.isMine
                          }
                          canLike={canAsk}
                          threadId={question.id}
                        />
                      </li>
                    ))}

                    <PendingMessages threadId={question.id} />
                  </ol>
                )}
              </li>
            ))}

            <PendingMessages />
          </ol>
        )}

        {canAsk ? (
          // Este formulário abre uma dúvida NOVA; responder dentro de uma
          // conversa é o formulário que nasce do botão "Responder".
          <QuestionForm lessonId={lessonId} instructor={target} />
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-prime-light/50 text-sm">
            Libere o acesso a esta aula para perguntar.
          </p>
        )}
      </div>
    </QuestionsProvider>
  );
}

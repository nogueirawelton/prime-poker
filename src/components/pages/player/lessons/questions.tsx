import Image from "next/image";
import type { Question } from "@/services/lesson-detail";
import { initials } from "@/utils/initials";
import { QuestionActions } from "./question-actions";
import { QuestionForm } from "./question-form";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Conversa com o instrutor da aula.
 *
 * Uma seção só, sem abas: a dúvida vai para quem dá a aula, e a resposta
 * chega no mesmo lugar.
 */
export function Questions({
  lessonId,
  questions,
  instructor,
  canAsk,
}: {
  lessonId: number;
  questions: Array<Question>;
  instructor: string;
  /** Aula trancada não recebe pergunta: o plugin recusa, e com razão. */
  canAsk: boolean;
}) {
  // Aula sem instrutor cadastrado ainda recebe dúvidas — quem responde é a
  // equipe de qualquer forma.
  const target = instructor || "o instrutor";

  return (
    <div className="flex flex-col gap-6">
      {questions.length === 0 ? (
        <p className="py-6 text-center text-prime-light/50 text-sm">
          Nenhuma dúvida ainda. Pergunte a {target}.
        </p>
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
                      />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
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
  );
}

/** Uma fala da conversa: quem escreveu, quando e o quê. */
function Message({ message }: { message: Question }) {
  return (
    <article className="flex items-start gap-3">
      {/* A foto quando existe, as iniciais quando não. Nas respostas da
          equipe a foto é a do instrutor da aula, que é de quem a resposta
          leva o nome. */}
      {message.avatarUrl ? (
        <Image
          src={message.avatarUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className={
            message.isInstructor
              ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-prime-red/20 font-bold text-[11px] text-prime-red"
              : "flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px] text-prime-light"
          }
        >
          {initials(message.author)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-bold text-prime-light text-sm">
            {message.author}
          </strong>

          {message.isInstructor && (
            <span className="rounded-full bg-prime-red/15 px-2 py-0.5 font-semibold text-[10px] text-prime-red uppercase">
              Instrutor
            </span>
          )}

          <time dateTime={message.data} className="text-prime-light/40 text-xs">
            {formatter.format(new Date(message.data))}
          </time>
        </div>

        <p className="mt-1 whitespace-pre-line text-prime-light/70 text-sm leading-relaxed">
          {message.text}
        </p>
      </div>
    </article>
  );
}

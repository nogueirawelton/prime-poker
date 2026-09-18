import type { Question } from "@/services/lesson-detail";
import { initials } from "@/utils/initials";
import { QuestionForm } from "./question-form";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Iniciais para o avatar, enquanto não há foto vinda do CMS. */
/**
 * Conversa com o instrutor da aula.
 *
 * Uma seção só, sem abas: a dúvida vai para quem dá a aula, e a resposta
 * chega no mesmo lugar.
 */
export function Questions({
  slug,
  questions,
  instructor,
}: {
  slug: string;
  questions: Array<Question>;
  instructor: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {questions.length === 0 ? (
        <p className="py-6 text-center text-prime-light/50 text-sm">
          Nenhuma dúvida ainda. Pergunte a {instructor}.
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {questions.map((question) => (
            <li key={question.id} className="flex items-start gap-3">
              <span
                className={
                  question.isInstructor
                    ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-prime-red/20 font-bold text-[11px] text-prime-red"
                    : "flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px] text-prime-light"
                }
              >
                {initials(question.author)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-bold text-prime-light text-sm">
                    {question.author}
                  </strong>

                  {question.isInstructor && (
                    <span className="rounded-full bg-prime-red/15 px-2 py-0.5 font-semibold text-[10px] text-prime-red uppercase">
                      Instrutor
                    </span>
                  )}

                  <time
                    dateTime={question.data}
                    className="text-prime-light/40 text-xs"
                  >
                    {formatter.format(new Date(question.data))}
                  </time>
                </div>

                <p className="mt-1 whitespace-pre-line text-prime-light/70 text-sm leading-relaxed">
                  {question.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <QuestionForm slug={slug} instructor={instructor} />
    </div>
  );
}

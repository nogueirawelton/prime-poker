import Image from "next/image";
import { twMerge } from "tailwind-merge";
import type { Question } from "@/services/lesson-detail";
import { initials } from "@/utils/initials";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Uma fala da conversa: quem escreveu, quando e o quê. */
export function Message({
  message,
  sending,
}: {
  message: Question;
  /** Ainda indo para o servidor: aparece esmaecida, com o aviso no lugar da hora. */
  sending?: boolean;
}) {
  return (
    <article
      aria-busy={sending || undefined}
      className={twMerge(
        "flex items-start gap-3 transition-opacity duration-300",
        sending && "opacity-60",
      )}
    >
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

          {sending ? (
            <span className="text-prime-light/40 text-xs">Enviando...</span>
          ) : (
            <time
              dateTime={message.data}
              className="text-prime-light/40 text-xs"
            >
              {formatter.format(new Date(message.data))}
            </time>
          )}
        </div>

        <p className="mt-1 whitespace-pre-line text-prime-light/70 text-sm leading-relaxed">
          {message.text}
        </p>
      </div>
    </article>
  );
}

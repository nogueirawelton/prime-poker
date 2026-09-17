import type { Duvida } from "@/services/aula-detalhe";
import { iniciais } from "@/utils/iniciais";
import { DuvidaForm } from "./duvida-form";

const formatador = new Intl.DateTimeFormat("pt-BR", {
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
export function Duvidas({
  slug,
  duvidas,
  instrutor,
}: {
  slug: string;
  duvidas: Array<Duvida>;
  instrutor: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {duvidas.length === 0 ? (
        <p className="py-6 text-center text-prime-light/50 text-sm">
          Nenhuma dúvida ainda. Pergunte a {instrutor}.
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {duvidas.map((duvida) => (
            <li key={duvida.id} className="flex items-start gap-3">
              <span
                className={
                  duvida.ehInstrutor
                    ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-prime-red/20 font-bold text-[11px] text-prime-red"
                    : "flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px] text-prime-light"
                }
              >
                {iniciais(duvida.autor)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-bold text-prime-light text-sm">
                    {duvida.autor}
                  </strong>

                  {duvida.ehInstrutor && (
                    <span className="rounded-full bg-prime-red/15 px-2 py-0.5 font-semibold text-[10px] text-prime-red uppercase">
                      Instrutor
                    </span>
                  )}

                  <time
                    dateTime={duvida.data}
                    className="text-prime-light/40 text-xs"
                  >
                    {formatador.format(new Date(duvida.data))}
                  </time>
                </div>

                <p className="mt-1 whitespace-pre-line text-prime-light/70 text-sm leading-relaxed">
                  {duvida.texto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <DuvidaForm slug={slug} instrutor={instrutor} />
    </div>
  );
}

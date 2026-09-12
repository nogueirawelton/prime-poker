import type { Icon } from "@phosphor-icons/react";
import {
  BookmarkSimpleIcon,
  ClockIcon,
  FlameIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Progresso } from "@/services/perfil";

/** Números do estudo e o avanço em cada trilha. */
export function ProgressoCard({
  progresso,
  salvas,
}: {
  progresso: Progresso;
  salvas: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Numero
          icone={GraduationCapIcon}
          valor={`${progresso.concluidas}/${progresso.total}`}
          rotulo="Aulas concluídas"
        />
        <Numero
          icone={ClockIcon}
          valor={`${progresso.horas}h`}
          rotulo="Tempo de estudo"
        />
        <Numero
          icone={FlameIcon}
          valor={`${progresso.sequencia} dias`}
          rotulo="Sequência"
        />
        <Numero
          icone={BookmarkSimpleIcon}
          valor={String(salvas)}
          rotulo="Aulas salvas"
        />
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/3 p-6">
        <h2 className="font-bold text-prime-light text-sm uppercase tracking-wide">
          Progresso por trilha
        </h2>

        <ul className="flex flex-col gap-4">
          {progresso.trilhas.map((trilha) => {
            const porcentagem = Math.round(
              (trilha.concluidas / trilha.total) * 100,
            );

            return (
              <li key={trilha.categoria.slug} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-prime-light">
                    {trilha.categoria.nome}
                  </span>
                  <span className="text-prime-light/50 text-xs tabular-nums">
                    {trilha.concluidas}/{trilha.total}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={porcentagem}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso em ${trilha.categoria.nome}`}
                  className="h-1.5 overflow-hidden rounded-full bg-prime-light/10"
                >
                  <div
                    className="h-full rounded-full bg-prime-red transition-all duration-700"
                    style={{ width: `${porcentagem}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Numero({
  icone: Icone,
  valor,
  rotulo,
}: {
  icone: Icon;
  valor: string;
  rotulo: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/3 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-prime-red/15 text-prime-red">
        <Icone className="size-5" weight="fill" aria-hidden="true" />
      </span>

      <span>
        <strong className="block font-black text-prime-light text-xl">
          {valor}
        </strong>
        <span className="block text-prime-light/50 text-xs uppercase tracking-wide">
          {rotulo}
        </span>
      </span>
    </div>
  );
}

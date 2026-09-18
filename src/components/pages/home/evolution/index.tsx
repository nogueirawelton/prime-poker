import type { Evolution as EvolutionType } from "@/@types/pages/Home";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { formatUsd } from "@/utils/currency";
import { ChartLazy } from "./chart-lazy";
import { Testimonials } from "./testimonials";

type EvolutionProps = {
  content: EvolutionType;
};

export function Evolution({ content }: EvolutionProps) {
  return (
    <section id="evolucao" className="bg-prime-dark">
      <AnimationContainer
        animation="home/evolution"
        className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24"
      >
        <div data-el="data" className="flex flex-col">
          <strong
            data-el="strong"
            className="flex items-center gap-2 font-normal text-prime-red uppercase"
          >
            <Cards className="size-6 stroke-prime-red" />
            Evolução
          </strong>

          <h2
            className="break mt-2 flex items-center gap-2 font-bold text-3xl text-prime-light uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />

          <p className="mt-4 max-w-2xl text-prime-light text-sm lg:text-base">
            {content.description}
          </p>
        </div>

        {/* Cabeçalho renderizado no servidor (conteúdo indexável);
            apenas o canvas do Chart.js é adiado para o cliente. */}
        <div
          data-el="chart"
          className="mt-12 rounded-md bg-white/5 p-6 shadow-lg"
        >
          <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row lg:items-center">
            <div>
              <h3 className="font-semibold text-lg text-white">
                Ganhos Acumulados
              </h3>
              <p className="text-gray-400 text-sm">
                Evolução desde nossa fundação em 2018
              </p>
            </div>
            <span className="font-bold text-prime-red/75 text-xl">
              {formatUsd(content.accumulatedEarnings.at(-1)?.amount ?? 0)}
            </span>
          </div>

          <ChartLazy content={content.accumulatedEarnings} />
        </div>

        <Testimonials content={content.successStories} />
      </AnimationContainer>
    </section>
  );
}

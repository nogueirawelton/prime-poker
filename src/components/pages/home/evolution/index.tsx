import { Cards } from "@/icons/cards";
import Chart from "./chart";
import { Testimonials } from "./testimonials";

export function Evolution() {
  return (
    <section id="evolucao" className="bg-prime-dark">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
        <div className="flex flex-col">
          <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
            <Cards className="stroke-prime-red size-6" />
            Evolução
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-4xl font-bold uppercase">
            Dados transparentes, <br className="hidden lg:block" /> resultados
            consistentes
          </h2>

          <p className="text-prime-light mt-4 max-w-2xl">
            Nossos resultados falam por si. Veja a evolução financeira acumulada
            do Prime Poker Team.
          </p>
        </div>

        <Chart />

        <Testimonials />
      </div>
    </section>
  );
}

import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { Form } from "./form/form";

export function BePart() {
  return (
    <section id="faca-parte" className="bg-zinc-950">
      <AnimationContainer
        animation="home/bePart"
        className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8 lg:py-24"
      >
        <div>
          <div data-el="data" className="flex flex-col">
            <strong
              data-el="strong"
              className="text-prime-red flex items-center gap-2 font-normal uppercase"
            >
              <Cards className="stroke-prime-red size-6" />
              Faça Parte
            </strong>

            <h2 className="text-prime-light mt-2 flex items-center gap-2 text-3xl font-bold uppercase lg:text-4xl">
              Se você leva o jogo a sério, <br className="hidden lg:block" />{" "}
              aqui é o seu lugar.
            </h2>

            <p className="text-prime-light mt-4 max-w-2xl text-sm lg:text-base">
              Está pronto para levar seu poker para o próximo nível? Preencha o
              formulário e nossa equipe entrará em contato para avaliar seu
              perfil e conversar sobre as possibilidades.
            </p>
          </div>

          <div
            data-el="step-container"
            className="mt-8 rounded-md bg-white/3 px-6 py-8"
          >
            <h3 className="text-prime-light text-xl font-bold">
              Processo de Seleção
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              <div
                data-el="step"
                className="text-prime-light flex items-center gap-3"
              >
                <span className="bg-prime-red/75 grid size-9 shrink-0 place-items-center rounded-full font-bold">
                  1
                </span>
                <strong className="text-prime-light/75 text-sm font-normal lg:text-base">
                  Preencha o formulário de inscrição
                </strong>
              </div>

              <div
                data-el="step"
                className="text-prime-light flex items-center gap-3"
              >
                <span className="bg-prime-red/75 relative grid size-9 shrink-0 place-items-center rounded-full font-bold">
                  2
                </span>
                <strong className="text-prime-light/75 text-sm font-normal lg:text-base">
                  Entrevista com um de nossos coaches
                </strong>
              </div>

              <div
                data-el="step"
                className="text-prime-light flex items-center gap-3"
              >
                <span className="bg-prime-red/75 grid size-9 shrink-0 place-items-center rounded-full font-bold">
                  3
                </span>
                <strong className="text-prime-light/75 text-sm font-normal lg:text-base">
                  Análise do seu histórico de jogo
                </strong>
              </div>

              <div
                data-el="step"
                className="text-prime-light flex items-center gap-3"
              >
                <span className="bg-prime-red/75 grid size-9 shrink-0 place-items-center rounded-full font-bold">
                  4
                </span>
                <strong className="text-prime-light/75 text-sm font-normal lg:text-base">
                  Proposta personalizada para seu desenvolvimento
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div
          data-el="form"
          className="border-prime-red/75 mt-8 rounded-md border bg-white/3 px-6 py-8"
        >
          <Form />
        </div>
      </AnimationContainer>
    </section>
  );
}

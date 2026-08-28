import type { BePart as BePartType } from "@/@types/pages/Home";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { Form } from "./form";

type BePartProps = {
  content: BePartType;
};

export function BePart({ content }: BePartProps) {
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
              className="flex items-center gap-2 font-normal text-prime-red uppercase"
            >
              <Cards className="size-6 stroke-prime-red" />
              Faça Parte
            </strong>

            <h2
              className="break mt-2 flex items-center gap-2 font-bold text-3xl text-prime-light uppercase lg:text-4xl"
              dangerouslySetInnerHTML={{ __html: content.title }}
            />

            <p className="mt-4 max-w-2xl text-prime-light text-sm lg:text-base">
              {content.description}
            </p>
          </div>

          <div
            data-el="step-container"
            className="mt-8 rounded-md bg-white/3 px-6 py-8"
          >
            <h3 className="font-bold text-prime-light text-xl">
              Processo de Seleção
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              {content.steps.map((step, index) => (
                <div
                  key={index}
                  data-el="step"
                  className="flex items-center gap-3 text-prime-light"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-prime-red/75 font-bold">
                    {index + 1}
                  </span>
                  <strong className="font-normal text-prime-light/75 text-sm lg:text-base">
                    {step.step}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          data-el="form"
          className="mt-8 rounded-md border border-prime-red/75 bg-white/3 px-6 py-8"
        >
          <Form />
        </div>
      </AnimationContainer>
    </section>
  );
}

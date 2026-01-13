import { BePart as BePartType } from "@/@types/pages/Home";
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
              className="text-prime-red flex items-center gap-2 font-normal uppercase"
            >
              <Cards className="stroke-prime-red size-6" />
              Faça Parte
            </strong>

            <h2
              className="text-prime-light break mt-2 flex items-center gap-2 text-3xl font-bold uppercase lg:text-4xl"
              dangerouslySetInnerHTML={{ __html: content.title }}
            />

            <p className="text-prime-light mt-4 max-w-2xl text-sm lg:text-base">
              {content.description}
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
              {content.steps.map((step, index) => (
                <div
                  key={index}
                  data-el="step"
                  className="text-prime-light flex items-center gap-3"
                >
                  <span className="bg-prime-red/75 grid size-9 shrink-0 place-items-center rounded-full font-bold">
                    {index + 1}
                  </span>
                  <strong className="text-prime-light/75 text-sm font-normal lg:text-base">
                    {step.step}
                  </strong>
                </div>
              ))}
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

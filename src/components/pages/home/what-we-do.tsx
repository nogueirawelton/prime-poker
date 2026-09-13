import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import type { WhatWeDo as WhatWeDoType } from "@/@types/pages/Home";
import { FormDialog } from "@/components/shared/form-dialog";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";

type WhatWeDoProps = {
  content: WhatWeDoType;
};

export function WhatWeDo({ content }: WhatWeDoProps) {
  return (
    <section id="o-que-fazemos" className="bg-prime-dark">
      <AnimationContainer
        animation="home/whatWeDo"
        className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24"
      >
        <div
          data-el="data"
          className="flex flex-col items-center justify-center"
        >
          <strong
            data-el="strong"
            className="flex items-center gap-2 font-normal text-prime-red uppercase"
          >
            <Cards className="size-6 stroke-prime-red" />O que Fazemos
          </strong>

          <h2
            className="break mt-2 flex items-center gap-2 text-center font-bold text-3xl text-prime-light uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{
              __html: content.title,
            }}
          />

          <p className="mt-4 max-w-2xl text-center text-prime-light text-sm lg:text-base">
            {content.description}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {content.feature.map((feature, key) => (
            <div data-el="card" key={key}>
              {/* `h-full`: o item do grid já estica, o cartão dentro dele não —
                  sem isso cada cartão para no tamanho do próprio texto. */}
              <div className="flex h-full flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4 transition-all duration-500 hover:scale-105 hover:border-prime-light">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-prime-red/75 text-prime-light">
                  <DynamicIcon
                    icon={feature.icon}
                    weight="fill"
                    className="size-7"
                  />
                </span>

                <h3 className="mt-6 gap-2 font-bold text-prime-light text-xl lg:text-2xl">
                  {feature.title}
                </h3>

                <p className="mt-2 text-prime-light text-sm lg:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          data-el="big-card"
          className="mt-10 flex flex-col rounded-md border border-prime-red/75 bg-white/3 px-8 py-6"
        >
          <h3 className="break gap-2 text-center font-bold text-prime-light text-xl uppercase">
            {content.structure.title}
          </h3>

          <div className="mt-8 grid gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            {content.structure.items.map((item, key) => (
              <div
                key={key}
                className="flex items-center gap-3 text-prime-light"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-prime-red/75">
                  <CheckIcon weight="bold" />
                </span>
                <strong className="font-normal text-sm lg:text-base">
                  {item.item}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div data-el="cta">
          <FormDialog>
            <button className="mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-md bg-prime-red px-4 font-medium text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red lg:text-base">
              Suba de nível agora
              <CaretRightIcon className="size-6" />
            </button>
          </FormDialog>
        </div>
      </AnimationContainer>
    </section>
  );
}

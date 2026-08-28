import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { Collapsible } from "radix-ui";
import type { Faq as FaqType } from "@/@types/pages/Home";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";

type FaqProps = {
  content: FaqType;
};

export function Faq({ content }: FaqProps) {
  return (
    <section id="faq" className="bg-prime-dark">
      <AnimationContainer
        animation="home/faq"
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
            <Cards className="size-6 stroke-prime-red" />
            Perguntas frequentes
          </strong>

          <h2
            className="break mt-2 flex items-center gap-2 text-center font-bold text-3xl text-prime-light uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{
              __html: content.title,
            }}
          />
        </div>

        <div
          data-el="faq-items"
          className="mx-auto mt-12 flex max-w-screen-md flex-col gap-1"
        >
          {content.questions.map((question, index) => (
            <div className="border-white/20 border-b" key={index}>
              <Collapsible.Root>
                <Collapsible.Trigger className="group flex min-h-14 w-full cursor-pointer items-center justify-between py-1 text-left font-medium text-lg text-prime-light">
                  {question.title}{" "}
                  <CaretDownIcon
                    weight="bold"
                    className="size-6 text-prime-red/85 transition-all duration-500 group-data-[state=open]:rotate-180"
                  />
                </Collapsible.Trigger>

                <Collapsible.Content className="overflow-hidden text-prime-light data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
                  <p className="pb-2 text-sm lg:text-base">{question.answer}</p>
                </Collapsible.Content>
              </Collapsible.Root>
            </div>
          ))}
        </div>
      </AnimationContainer>
    </section>
  );
}

import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Instructors as InstructorsType } from "@/@types/pages/Home";
import { FormDialog } from "@/components/shared/form-dialog";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { Carrousel } from "./carrousel";

type InstructorsProps = {
  content: InstructorsType;
};

export function Instructors({ content }: InstructorsProps) {
  return (
    <section id="instrutores" className="bg-zinc-950">
      <AnimationContainer
        animation="home/instructors"
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
            Instrutores
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

        <Carrousel content={content.instructors} />

        <div data-el="cta">
          <FormDialog>
            <button className="mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-md bg-prime-red px-4 font-medium text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red lg:text-base">
              Aprenda com quem entende do jogo
              <CaretRightIcon className="size-6" />
            </button>
          </FormDialog>
        </div>
      </AnimationContainer>
    </section>
  );
}

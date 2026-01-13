import { Instructors as InstructorsType } from "@/@types/pages/Home";
import { FormDialog } from "@/components/globals/form-dialog";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
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
            className="text-prime-red flex items-center gap-2 font-normal uppercase"
          >
            <Cards className="stroke-prime-red size-6" />
            Instrutores
          </strong>

          <h2
            className="text-prime-light break mt-2 flex items-center gap-2 text-center text-3xl font-bold uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{
              __html: content.title,
            }}
          />

          <p className="text-prime-light mt-4 max-w-2xl text-center text-sm lg:text-base">
            {content.description}
          </p>
        </div>

        <Carrousel content={content.instructors} />

        <div data-el="cta">
          <FormDialog>
            <button className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium transition-all duration-500 lg:text-base">
              Aprenda com quem entende do jogo
              <CaretRightIcon className="size-6" />
            </button>
          </FormDialog>
        </div>
      </AnimationContainer>
    </section>
  );
}

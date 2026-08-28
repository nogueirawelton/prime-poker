import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { List } from "./list";

export async function Instagram() {
  return (
    <section id="intagram" className="overflow-hidden bg-zinc-950">
      <AnimationContainer
        animation="home/instagram"
        className="flex flex-col pt-12 pb-4 lg:pt-24"
      >
        {/* O cabeçalho respeita o container; a faixa do feed é full-bleed. */}
        <div
          data-el="data"
          className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center px-4 lg:px-8"
        >
          <strong
            data-el="strong"
            className="flex items-center gap-2 font-normal text-prime-red uppercase"
          >
            <Cards className="size-6 stroke-prime-red" />
            @primepokerteam
          </strong>

          <h2 className="mt-2 flex items-center gap-2 text-center font-bold text-3xl text-prime-light uppercase lg:text-4xl">
            Siga-nos <br className="hidden lg:block" /> no instagram
          </h2>
        </div>

        <div data-el="posts" className="w-full px-2">
          <Suspense
            fallback={
              <div className="mt-12 flex gap-2">
                {Array(6)
                  .fill("")
                  .map((_, key) => (
                    <div
                      key={key}
                      className="grid aspect-square basis-4/5 place-items-center rounded-md bg-white/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <CircleNotchIcon className="size-10 animate-spin text-prime-red/60" />
                    </div>
                  ))}
              </div>
            }
          >
            <List />
          </Suspense>
        </div>
      </AnimationContainer>
    </section>
  );
}

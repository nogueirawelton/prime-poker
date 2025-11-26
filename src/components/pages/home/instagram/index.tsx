import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { List } from "./list";

export async function Instagram() {
  return (
    <section id="intagram" className="bg-zinc-950">
      <AnimationContainer
        animation="home/instagram"
        className="mx-auto flex max-w-screen-xl flex-col px-4 py-12 lg:px-8 lg:py-24"
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
            @primepokerteam
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-center text-3xl font-bold uppercase lg:text-4xl">
            Siga-nos <br className="hidden lg:block" /> no instagram
          </h2>
        </div>

        <div data-el="posts">
          <Suspense
            fallback={
              <div className="mt-12 grid gap-2 lg:grid-cols-4">
                {Array(4)
                  .fill("")
                  .map((_, key) => (
                    <div
                      key={key}
                      className="grid aspect-square place-items-center bg-white"
                    >
                      <CircleNotchIcon className="text-galwan-blue-400 size-10 animate-spin" />
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

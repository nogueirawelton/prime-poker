import { Cards } from "@/icons/cards";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { List } from "./list";

export async function Instagram() {
  return (
    <section id="intagram" className="bg-zinc-950">
      <div className="mx-auto flex max-w-screen-xl flex-col px-4 py-12 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center">
          <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
            <Cards className="stroke-prime-red size-6" />
            @primepokerteam
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-center text-4xl font-bold uppercase">
            Siga-nos <br className="hidden lg:block" /> no instagram
          </h2>
        </div>

        <Suspense
          fallback={
            <div className="mt-12 grid lg:grid-cols-4">
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
    </section>
  );
}

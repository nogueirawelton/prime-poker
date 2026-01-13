import { WhoWeAre as WhoWeAreType } from "@/@types/pages/Home";
import { FormDialog } from "@/components/globals/form-dialog";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { Fragment } from "react";

type WhoWeAreProps = {
  content: WhoWeAreType;
};

export function WhoWeAre({ content }: WhoWeAreProps) {
  return (
    <section id="quem-somos" className="-mt-px bg-zinc-950">
      <AnimationContainer animation="home/whoWeAre">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div data-el="data">
              <strong
                data-el="strong"
                className="text-prime-red flex items-center gap-2 font-normal uppercase"
              >
                <Cards className="stroke-prime-red size-6" />
                Quem Somos
              </strong>

              <h2
                className="text-prime-light break mt-2 flex items-center gap-2 text-3xl font-bold uppercase lg:text-4xl"
                dangerouslySetInnerHTML={{
                  __html: content.title,
                }}
              />

              <div
                className="text-prime-light mt-6 flex flex-col gap-4 text-sm lg:text-base"
                dangerouslySetInnerHTML={{
                  __html: content.description,
                }}
              />

              <div data-el="cta">
                <FormDialog>
                  <button className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mt-8 flex h-14 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium transition-all duration-500 lg:text-base">
                    Evolua com a Prime Poker
                    <CaretRightIcon className="size-6" />
                  </button>
                </FormDialog>
              </div>
            </div>

            <div className="grid place-items-center">
              <div className="flex w-fit flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4">
                    <h3 className="text-prime-red/75 text-4xl font-bold lg:text-5xl">
                      <span data-el="count">{content.years}</span>+
                    </h3>
                    <p className="text-sm tracking-wider text-gray-400 uppercase">
                      Anos no mercado
                    </p>
                  </div>

                  <div className="flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4">
                    <h3 className="text-prime-red/75 text-4xl font-bold lg:text-5xl">
                      <span data-el="count">{content.players}</span>+
                    </h3>
                    <p className="text-sm tracking-wider text-gray-400 uppercase">
                      Jogadores formados
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center rounded-md border border-white/3 bg-white/3 px-8 py-4">
                  <h3 className="text-prime-red/75 text-4xl font-bold lg:text-5xl">
                    ${" "}
                    {Number(content.earnings)
                      .toLocaleString("en-US")
                      .slice(0, 4)
                      .split(",")
                      .map((item, key) => (
                        <Fragment key={key}>
                          <span data-el="count">{item}</span>
                          <span className="last:hidden">,</span>
                        </Fragment>
                      ))}
                    M+
                  </h3>

                  <p className="text-sm tracking-wider text-gray-400 uppercase">
                    Em ganhos acumulados
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Image
            src="/img/about-ornament.svg"
            width={640}
            height={480}
            alt=""
            className="mx-auto mt-12 h-auto w-full max-w-[1024px] object-contain lg:mt-24"
          />

          <div className="text-prime-light mt-12 grid gap-8 lg:mt-24 lg:grid-cols-3 lg:gap-16">
            <div data-el="card" className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-2xl font-bold uppercase lg:text-3xl">
                Visão
              </h3>

              <p className="text-sm lg:text-base">{content.vision}</p>
            </div>

            <div data-el="card" className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-2xl font-bold uppercase lg:text-3xl">
                Missão
              </h3>

              <p className="text-sm lg:text-base">{content.mission}</p>
            </div>

            <div data-el="card" className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-2xl font-bold uppercase lg:text-3xl">
                Valores
              </h3>

              <p className="text-sm lg:text-base">{content.values}</p>
            </div>
          </div>
        </div>
      </AnimationContainer>
    </section>
  );
}

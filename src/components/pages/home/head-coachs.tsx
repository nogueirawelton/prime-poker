import { Cards } from "@/icons/cards";
import Image from "next/image";

export function HeadCoachs() {
  return (
    <section id="head-coachs" className="bg-zinc-900">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
        <div className="flex flex-col">
          <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
            <Cards className="stroke-prime-red size-6" />
            Head Coachs
          </strong>

          <h2 className="text-prime-light r mt-2 flex items-center gap-2 text-4xl font-bold uppercase">
            De quem já venceu <br className="hidden lg:block" /> para quem quer
            vencer.
          </h2>

          <p className="text-prime-light r mt-4 max-w-2xl">
            Nossos heads coaches jogadores com vasta experiência e resultados
            comprovados, prontos para compartilhar seu conhecimento.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-8">
          <div className="group grid gap-4 md:grid-cols-[350px_1fr] md:gap-8 even:md:grid-cols-[1fr_350px]">
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-md group-even:md:order-last">
              <Image
                src="/img/person-example-1.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="relative rounded-md border border-white/3 bg-white/3 px-8 py-8 transition-all duration-500 lg:py-16">
              <div className="top-4 right-4 mb-6 flex flex-wrap items-center gap-4 gap-y-2 lg:absolute lg:mb-0">
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  MTT Specialist
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Mental Game
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  ICM Master
                </span>
              </div>

              <h3 className="text-prime-light gap-2 text-3xl font-bold">
                Bruno "Furia" Silva
              </h3>

              <strong className="text-prime-red/85 mt-1 block font-medium">
                $1,200,000+ em ganhos
              </strong>

              <div className="text-prime-light mt-4 flex flex-col gap-4 md:max-w-[75%]">
                <p>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas
                  cum rerum provident voluptatem iure veniam at praesentium, et
                  voluptates ut deleniti dignissimos ipsum? Inventore facere
                  molestias modi nulla possimus magnam?
                </p>

                <p>
                  Especialista em torneios MTT com múltiplos títulos
                  internacionais e ROI consistente acima de 30%.
                </p>
              </div>
            </div>
          </div>

          <div className="group grid gap-4 md:grid-cols-[350px_1fr] md:gap-8 even:md:grid-cols-[1fr_350px]">
            <div className="relative min-h-[400px] overflow-hidden rounded-md group-even:md:order-last">
              <Image
                src="/img/person-example-3.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="relative rounded-md border border-white/3 bg-white/3 px-8 py-8 transition-all duration-500 lg:py-16">
              <div className="top-4 right-4 mb-6 flex flex-wrap items-center gap-4 gap-y-2 lg:absolute lg:mb-0">
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Cash Game
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  GTO Expert
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Hand Reading
                </span>
              </div>

              <h3 className="text-prime-light gap-2 text-3xl font-bold">
                Rafael "Shark" Costa
              </h3>

              <strong className="text-prime-red/85 mt-1 block font-medium">
                $850,000+ em ganhos
              </strong>

              <div className="text-prime-light mt-4 flex flex-col gap-4 md:max-w-[75%]">
                <p>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas
                  cum rerum provident voluptatem iure veniam at praesentium, et
                  voluptates ut deleniti dignissimos ipsum? Inventore facere
                  molestias modi nulla possimus magnam?
                </p>

                <p>
                  Lenda do cash game com mais de 10 anos de experiência,
                  especializado em jogos de alto stake.
                </p>
              </div>
            </div>
          </div>

          <div className="group grid gap-4 md:grid-cols-[350px_1fr] md:gap-8 even:md:grid-cols-[1fr_350px]">
            <div className="relative min-h-[400px] overflow-hidden rounded-md group-even:md:order-last">
              <Image
                src="/img/person-example-2.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="relative rounded-md border border-white/3 bg-white/3 px-8 py-8 transition-all duration-500 lg:py-16">
              <div className="top-4 right-4 mb-6 flex flex-wrap items-center gap-4 gap-y-2 lg:absolute lg:mb-0">
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Spin & Go
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Hyper-Turbo
                </span>
                <span className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1">
                  Short Stack
                </span>
              </div>

              <h3 className="text-prime-light gap-2 text-3xl font-bold">
                Camila "Rainha" Oliveira
              </h3>

              <strong className="text-prime-red/85 mt-1 block font-medium">
                $600,000+ em ganhos
              </strong>

              <div className="text-prime-light mt-4 flex flex-col gap-4 md:max-w-[75%]">
                <p>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas
                  cum rerum provident voluptatem iure veniam at praesentium, et
                  voluptates ut deleniti dignissimos ipsum? Inventore facere
                  molestias modi nulla possimus magnam?
                </p>

                <p>
                  Especialista em Spin & Go e jogos rápidos, com ROI acima de
                  15% em mais de 50.000 torneios jogados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

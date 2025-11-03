import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export function WhoWeAre() {
  return (
    <section id="quem-somos" className="-mt-px bg-zinc-950">
      <AnimationContainer animation="home/whoWeAre">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
                <Cards className="stroke-prime-red size-6" />
                Quem Somos
              </strong>

              <h2 className="text-prime-light mt-2 flex items-center gap-2 text-4xl font-bold uppercase">
                Onde a paixão pelo poker encontra a excelência
              </h2>

              <div className="text-prime-light mt-6 flex flex-col gap-4">
                <p>
                  O Prime Poker Team é a equipe de poker mais vencedora do
                  Brasil, formada por jogadores profissionais que já acumularam
                  milhões em ganhos e estão comprometidos em elevar o nível do
                  nacional.
                </p>

                <p>
                  Nossa missão é desenvolver jogadores completos, não apenas
                  tecnicamente, mas também mental e fisicamente, para que possam
                  alcançar todo seu potencial no poker e na vida.
                </p>
              </div>

              <Link
                href="#"
                className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mt-8 flex h-14 w-fit items-center gap-2 rounded-sm px-4 font-medium transition-all duration-500"
              >
                Evolua com a Prime Poker
                <CaretRightIcon className="size-6" />
              </Link>
            </div>

            <div className="grid place-items-center">
              <div className="flex w-fit flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col rounded-md border-white/3 bg-white/3 px-8 py-4">
                    <h3 className="text-4xl font-bold text-prime-red/75 lg:text-5xl">
                      05+
                    </h3>
                    <p className="text-sm tracking-wider text-gray-400 uppercase">
                      Anos no mercado
                    </p>
                  </div>

                  <div className="flex flex-col rounded-md border-white/3 bg-white/3 px-8 py-4">
                    <h3 className="text-4xl font-bold text-prime-red/75 lg:text-5xl">
                      150+
                    </h3>
                    <p className="text-sm tracking-wider text-gray-400 uppercase">
                      Jogadores formados
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center rounded-md border-white/3 bg-white/3 px-8 py-4">
                  <h3 className="text-4xl font-bold text-prime-red/75 lg:text-5xl">
                    $ 2.25M+
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
            <div className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-3xl font-bold uppercase">
                Visão
              </h3>

              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Assumenda accusamus similique at atque, maxime facere suscipit!
                Odio nesciunt aspernatur vero! Harum nulla exercitationem
                suscipit pariatur, eius mollitia laboriosam vitae quo?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-3xl font-bold uppercase">
                Missão
              </h3>

              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Assumenda accusamus similique at atque, maxime facere suscipit!
                Odio nesciunt aspernatur vero! Harum nulla exercitationem
                suscipit pariatur, eius mollitia laboriosam vitae quo?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-prime-light mt-2 gap-2 text-3xl font-bold uppercase">
                Valores
              </h3>

              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Assumenda accusamus similique at atque, maxime facere suscipit!
                Odio nesciunt aspernatur vero! Harum nulla exercitationem
                suscipit pariatur, eius mollitia laboriosam vitae quo?
              </p>
            </div>
          </div>
        </div>
      </AnimationContainer>
    </section>
  );
}

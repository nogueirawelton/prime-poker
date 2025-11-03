import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import {
  BrainIcon,
  CaretRightIcon,
  ChalkboardTeacherIcon,
  CheckIcon,
  CoinsIcon,
  ForkKnifeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function WhatWeDo() {
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
            className="text-prime-red flex items-center gap-2 font-normal uppercase"
          >
            <Cards className="stroke-prime-red size-6" />O que Fazemos
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-center text-3xl font-bold uppercase lg:text-4xl">
            Da mesa de jogo <br className="hidden lg:block" /> à mesa de
            decisões
          </h2>

          <p className="text-prime-light mt-4 max-w-2xl text-center text-sm lg:text-base">
            Oferecemos uma estrutura completa para desenvolvimento de jogadores
            de poker, desde iniciantes até profissionais consolidados.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div data-el="card">
            <div className="hover:border-prime-light flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4 transition-all duration-500 hover:scale-105">
              <span className="text-prime-light bg-prime-red/75 grid size-14 shrink-0 place-items-center rounded-full">
                <CoinsIcon weight="fill" className="size-7" />
              </span>

              <h3 className="text-prime-light mt-6 gap-2 text-xl font-bold lg:text-2xl">
                Banca
              </h3>

              <p className="text-prime-light mt-2 text-sm lg:text-base">
                Acesso a deals exclusivos e estrutura de banca compartilhada com
                os melhores termos do mercado.
              </p>
            </div>
          </div>

          <div data-el="card">
            <div className="hover:border-prime-light flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4 transition-all duration-500 hover:scale-105">
              <span className="text-prime-light bg-prime-red/75 grid size-14 shrink-0 place-items-center rounded-full">
                <ChalkboardTeacherIcon weight="fill" className="size-7" />
              </span>

              <h3 className="text-prime-light mt-6 gap-2 text-xl font-bold lg:text-2xl">
                Coaching
              </h3>

              <p className="text-prime-light mt-2 text-sm lg:text-base">
                Sessões individuais e em grupo com os melhores coaches do
                Brasil, focadas em suas necessidades específicas.
              </p>
            </div>
          </div>

          <div data-el="card">
            <div className="hover:border-prime-light flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4 transition-all duration-500 hover:scale-105">
              <span className="text-prime-light bg-prime-red/75 grid size-14 shrink-0 place-items-center rounded-full">
                <ForkKnifeIcon weight="fill" className="size-7" />
              </span>

              <h3 className="text-prime-light mt-6 gap-2 text-xl font-bold lg:text-2xl">
                Nutricionista
              </h3>

              <p className="text-prime-light mt-2 text-sm lg:text-base">
                Acompanhamento nutricional personalizado para manter alta
                performance durante longas sessões.
              </p>
            </div>
          </div>

          <div data-el="card">
            <div className="hover:border-prime-light flex flex-col rounded-md border border-white/3 bg-white/3 px-8 py-4 transition-all duration-500 hover:scale-105">
              <span className="text-prime-light bg-prime-red/75 grid size-14 shrink-0 place-items-center rounded-full">
                <BrainIcon weight="fill" className="size-7" />
              </span>

              <h3 className="text-prime-light mt-6 gap-2 text-xl font-bold lg:text-2xl">
                Psicólogo
              </h3>

              <p className="text-prime-light mt-2 text-sm lg:text-base">
                Suporte psicológico especializado para lidar com tilt, pressão e
                outros desafios mentais do poker.
              </p>
            </div>
          </div>
        </div>

        <div
          data-el="big-card"
          className="border-prime-red/75 mt-10 flex flex-col rounded-md border bg-white/3 px-8 py-6"
        >
          <h3 className="text-prime-light gap-2 text-center text-xl font-bold uppercase">
            Estrutura completa prime poker team
          </h3>

          <div className="mt-8 grid gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Aulas semanais com conteúdo atualizado
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Biblioteca de vídeos exclusivos
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Leakfinder individual
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Apoio nutricional personalizado
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Suporte psicológico especializado
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Gestão financeira e bankroll
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Table selection estratégica
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Deals exclusivos com melhores stakers
              </strong>
            </div>

            <div className="text-prime-light flex items-center gap-3">
              <span className="bg-prime-red/75 grid size-8 shrink-0 place-items-center rounded-full">
                <CheckIcon weight="bold" />
              </span>
              <strong className="text-sm font-normal lg:text-base">
                Plano de carreira personalizado
              </strong>
            </div>
          </div>
        </div>

        <div data-el="cta">
          <Link
            href="#"
            className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium transition-all duration-500 lg:text-base"
          >
            Suba de nível agora
            <CaretRightIcon className="size-6" />
          </Link>
        </div>
      </AnimationContainer>
    </section>
  );
}

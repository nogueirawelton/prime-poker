import { AnimationContainer } from "@/hooks/use-animation";
import { Scroller } from "@/hooks/use-smoother/scroller";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

export function Banner() {
  return (
    <section className="relative h-[calc(100vh-7rem)] bg-[radial-gradient(transparent,black),url(/img/banner-example.png)] bg-cover bg-center bg-no-repeat">
      <AnimationContainer
        animation="home/banner"
        className="text-prime-light mx-auto grid h-full max-w-screen-2xl items-center px-4 lg:px-8"
      >
        <div className="lg:pb-24">
          <h1 className="text-4xl font-bold uppercase lg:text-5xl">
            Domine o jogo com o{" "}
            <span className="text-prime-red lg:block">Prime Poker Team</span>
          </h1>

          <p className="mt-4 lg:text-lg">
            A equipe mais vencedora do poker brasileiro,{" "}
            <br className="hidden lg:block" /> transformando jogadores em
            campeões desde 2018.
          </p>

          <div data-el="cta">
            <Scroller
              href="#faca-parte"
              className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mt-8 flex h-14 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium transition-all duration-500 lg:text-base"
            >
              Faça Parte do Prime Poker Team{" "}
              <CaretRightIcon className="size-6" />
            </Scroller>
          </div>
        </div>
      </AnimationContainer>

      <Scroller
        href="#quem-somos"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 173 173"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M86.4999 55.0338C60.043 99.2147 30.2592 3.7151 0 44.5342C31.685 85.3534 61.9442 127.853 86.4999 172.034C112.006 127.012 139.889 84.0911 173 44.5342C140.84 3.7151 111.531 98.3753 86.4999 55.0338Z"
            fill="#151515"
          />
          <path
            d="M86.4999 31.5339C60.043 75.7147 30.2592 -31.2852 0 9.53388C31.685 50.353 61.9442 92.853 86.4999 137.034C112.006 92.0115 139.889 49.0908 173 9.53388C140.84 -31.2852 111.531 74.8754 86.4999 31.5339Z"
            fill="#939393"
          />
        </svg>
      </Scroller>
    </section>
  );
}

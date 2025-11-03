import { Cards } from "@/icons/cards";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Carrousel } from "./carrousel";

export function Instructors() {
  return (
    <section id="instrutores" className="bg-zinc-950">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center">
          <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
            <Cards className="stroke-prime-red size-6" />
            Instrutores
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-center text-4xl font-bold uppercase">
            Apoio constante. <br className="hidden lg:block" /> Progresso real.
          </h2>

          <p className="text-prime-light mt-4 max-w-2xl text-center">
            Nossa equipe de instrutores está sempre disponível para tirar
            dúvidas e ajudar no seu desenvolvimento.
          </p>
        </div>

        <Carrousel />

        <Link
          href="#"
          className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-sm px-4 font-medium transition-all duration-500"
        >
          Aprenda com quem entende do jogo
          <CaretRightIcon className="size-6" />
        </Link>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada | Prime Poker Team",
};

/**
 * 404 do site inteiro: URLs sem rota e `notFound()` sem um not-found mais
 * próximo. Fica fora do `(institucional)`, então não herda Header/Footer nem o
 * Lenis — mesma moldura enxuta das telas de autenticação.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <Link href="/" className="mb-10">
        <Image
          src="/img/logo-alt.svg"
          width={150}
          height={135}
          alt="Prime Poker Team"
          priority
        />
      </Link>

      <strong className="font-black text-7xl text-prime-red lg:text-9xl">
        404
      </strong>

      <h1 className="mt-4 font-black text-2xl text-prime-light uppercase lg:text-4xl">
        Essa mão não existe
      </h1>

      <p className="mt-4 max-w-md text-prime-light/70 text-sm lg:text-base">
        A página que você procura foi removida, mudou de endereço ou nunca
        existiu.
      </p>

      <Link
        href="/"
        className="mt-10 flex h-14 items-center justify-center rounded-md bg-prime-red px-8 font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
      >
        Voltar para o início
      </Link>
    </main>
  );
}

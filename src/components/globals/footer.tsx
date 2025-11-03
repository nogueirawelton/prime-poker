import { Scroller } from "@/hooks/use-smoother/scroller";
import {
  EnvelopeIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-prime-dark border-t border-white/10 py-12">
      <div className="mx-auto grid max-w-screen-2xl gap-12 px-4 lg:grid-cols-3 lg:px-8">
        <div>
          <Link
            href={"/"}
            className="text-prime-light flex items-center gap-4 text-lg font-bold uppercase"
          >
            <Image
              src="/img/logo.svg"
              width={90}
              height={80}
              alt="Prime Poker Logo"
              className="h-[60px] w-auto"
            />
            Prime Poker Team
          </Link>

          <p className="text-prime-light/75 mt-6 text-sm">
            A equipe mais vencedora do poker brasileiro, transformando jogadores
            em campeões desde 2018.
          </p>

          <div className="text-prime-light/75 mt-8 flex gap-4">
            <a href="#" target="_blank">
              <InstagramLogoIcon
                className="hover:text-prime-light size-6 transition-all duration-500"
                weight="fill"
              />
            </a>

            <a href="#" target="_blank">
              <FacebookLogoIcon
                className="hover:text-prime-light size-6 transition-all duration-500"
                weight="fill"
              />
            </a>

            <a href="#" target="_blank">
              <XLogoIcon
                className="hover:text-prime-light size-6 transition-all duration-500"
                weight="fill"
              />
            </a>

            <a href="#" target="_blank">
              <YoutubeLogoIcon
                className="hover:text-prime-light size-6 transition-all duration-500"
                weight="fill"
              />
            </a>
          </div>
        </div>

        <div>
          <strong className="text-prime-light uppercase">Links Rápidos</strong>

          <nav className="[&_a]:hover:text-prime-red text-prime-light/85 mt-4 flex flex-col gap-2 text-sm [&_a]:transition-all [&_a]:duration-500">
            <Scroller href="#quem-somos">Quem Somos</Scroller>
            <Scroller href="#o-que-fazemos">O que Fazemos</Scroller>
            <Scroller href="#head-coachs">Head Coachs</Scroller>
            <Scroller href="#instrutores">Instrutores</Scroller>
            <Scroller href="#evolucao">Evolução</Scroller>
            <Scroller href="#faca-parte">Faça parte</Scroller>
          </nav>
        </div>

        <div>
          <strong className="text-prime-light uppercase">Contato</strong>

          <div className="text-prime-light/85 mt-4 flex flex-col gap-2 text-sm">
            <a
              href="mailto:contato@primepokerteam.com"
              className="flex items-center gap-2"
            >
              <EnvelopeIcon
                weight="fill"
                className="text-prime-red/75 size-6"
              />
              contato@primepokerteam.com
            </a>

            <a href="tel:+5511987654321" className="flex items-center gap-2">
              <PhoneIcon weight="fill" className="text-prime-red/75 size-6" />{" "}
              +55 11 98765-4321
            </a>

            <span className="flex items-center gap-2">
              <MapPinIcon weight="fill" className="text-prime-red/75 size-6" />{" "}
              Paulo - SP, Brasil
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

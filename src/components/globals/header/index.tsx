"use client";

import { Scroller } from "@/hooks/use-smoother/scroller";
import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(!!window.scrollY);
    }

    window.addEventListener("scroll", onScroll);

    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="bg-prime-dark border-prime-dark fixed top-0 z-40 w-full border-b transition-all duration-500 data-[scrolled=true]:border-white/6"
    >
      <div className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between px-4 py-2 lg:h-28 lg:px-8">
        <Link href={"/"} className="lg:h-full">
          <Image
            src="/img/logo.svg"
            width={90}
            height={80}
            alt="Prime Poker Logo"
            className="h-[70px] w-auto lg:h-full"
          />
        </Link>

        <nav className="[&_a]:hover:text-prime-red text-prime-light hidden items-center gap-6 text-sm font-semibold uppercase lg:flex [&_a]:transition-all [&_a]:duration-500">
          <Scroller href="#quem-somos">Quem Somos</Scroller>
          <Scroller href="#o-que-fazemos">O que Fazemos</Scroller>
          <Scroller href="#head-coachs">Head Coachs</Scroller>
          <Scroller href="#instrutores">Instrutores</Scroller>
          <Scroller href="#evolucao">Evolução</Scroller>
          <Scroller href="#faca-parte">Faça parte</Scroller>
        </nav>

        <button className="lg:hidden">
          <ListIcon className="text-prime-light size-7" />
        </button>
      </div>
    </header>
  );
}

"use client";

import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuMobileTrigger } from "./mobile-menu";

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
      className="bg-prime-dark group border-prime-dark fixed top-0 z-40 w-full border-b transition-all duration-500 data-[scrolled=true]:border-white/10"
    >
      <div className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between px-4 py-2 lg:h-28 lg:px-8">
        <Link href={"/"}>
          <Image
            src="/img/logo.svg"
            width={90}
            height={80}
            alt="Prime Poker Logo"
            className="h-[70px] w-auto transition-all duration-500 group-data-[scrolled=true]:h-[70px] lg:h-[90px]"
          />
        </Link>

        <nav className="[&_a]:hover:text-prime-red text-prime-light hidden items-center gap-6 text-sm font-semibold uppercase lg:flex [&_a]:transition-all [&_a]:duration-500">
          <Link href="#quem-somos">Quem Somos</Link>
          <Link href="#o-que-fazemos">O que Fazemos</Link>
          <Link href="#head-coachs">Head Coachs</Link>
          <Link href="#instrutores">Instrutores</Link>
          <Link href="#evolucao">Evolução</Link>
          <Link href="#faca-parte">Faça parte</Link>
        </nav>

        <MenuMobileTrigger>
          <button className="lg:hidden">
            <ListIcon className="text-prime-light size-7" />
          </button>
        </MenuMobileTrigger>
      </div>
    </header>
  );
}

"use client";

// TODO: reativar junto com o botão "Entrar" (área logada oculta na master).
// import { ListIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MenuMobileTrigger } from "./mobile-menu";

const ANCHORS = [
  { hash: "#quem-somos", label: "Quem Somos" },
  { hash: "#o-que-fazemos", label: "O que Fazemos" },
  { hash: "#head-coaches", label: "Head Coaches" },
  { hash: "#instrutores", label: "Instrutores" },
  { hash: "#evolucao", label: "Evolução" },
  { hash: "#faca-parte", label: "Faça parte" },
];

export function Header() {
  const headerRef = useRef<HTMLElement>(null);

  // Fora da home os alvos das âncoras não existem no DOM: o link precisa
  // navegar para a home e só então rolar.
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  // `false` = header translúcido sobre o banner; `true` = sólido.
  const [scrolled, setScrolled] = useState(false);

  // Auto-hide: recolhe ao descer, revela ao subir.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const banner = document.querySelector("[data-banner]");

    // Páginas sem banner não têm o que revelar: header sólido desde o topo.
    if (!banner) {
      setScrolled(true);
      return;
    }

    const target = banner;
    let observer: IntersectionObserver | null = null;

    // O recuo no topo é a altura do header, que muda no breakpoint lg —
    // por isso o observer é recriado no resize em vez de usar valor fixo.
    function observe() {
      observer?.disconnect();

      const offset = headerRef.current?.offsetHeight ?? 0;

      observer = new IntersectionObserver(
        ([entry]) => setScrolled(!entry.isIntersecting),
        { rootMargin: `-${offset}px 0px 0px 0px` },
      );

      observer.observe(target);
    }

    observe();

    // O IntersectionObserver só dispara em cruzamentos: se a primeira
    // observação acontecer antes do layout assentar (fontes/imagens ainda
    // carregando), o estado trava. Reobservar no `load` corrige a medida.
    if (document.readyState !== "complete") {
      window.addEventListener("load", observe);
    }

    window.addEventListener("resize", observe);

    return () => {
      observer?.disconnect();
      window.removeEventListener("load", observe);
      window.removeEventListener("resize", observe);
    };
  }, []);

  useEffect(() => {
    // Movimentos menores que isso são ruído (trackpad, bounce do iOS).
    const THRESHOLD = 8;

    let lastY = window.scrollY;
    let frame = 0;

    // Durante um scroll disparado por âncora, recolher o header seria punir o
    // usuário por ter usado a navegação. O Lenis resolve as âncoras sozinho
    // (`anchors: true`), então detectamos o clique aqui e soltamos a supressão
    // quando o scroll para.
    let programmatic = false;
    let idle = 0;

    function onAnchorClick(event: MouseEvent) {
      const target = event.target as Element | null;
      if (!target?.closest?.('a[href^="#"]')) return;

      programmatic = true;
      setHidden(false);
    }

    function releaseWhenIdle() {
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        programmatic = false;
        lastY = window.scrollY;
      }, 150);
    }

    function onScroll() {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        if (programmatic) {
          lastY = window.scrollY;
          releaseWhenIdle();
          return;
        }

        const y = window.scrollY;
        const delta = y - lastY;

        // Sem atualizar `lastY`: deltas pequenos se acumulam até o limiar.
        if (Math.abs(delta) < THRESHOLD) return;

        // Nunca esconde na faixa do topo — ali o header ainda está sobre o
        // banner e recolher pareceria um glitch.
        const offset = headerRef.current?.offsetHeight ?? 0;

        setHidden(delta > 0 && y > offset);
        lastY = y;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Captura: precisa rodar antes do handler do Lenis.
    document.addEventListener("click", onAnchorClick, true);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onAnchorClick, true);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-hidden={hidden}
      data-scrolled={scrolled}
      className="group fixed top-0 z-40 w-full border-transparent border-b bg-black/20 transition-all duration-500 data-[hidden=true]:-translate-y-full data-[scrolled=true]:border-white/10 data-[scrolled=true]:bg-prime-dark"
    >
      <div className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between px-4 py-2 lg:h-28 lg:px-8">
        <Link href={"/"}>
          <Image
            src="/img/logo.svg"
            width={210}
            height={45}
            alt="Prime Poker Logo"
            className="transition-all duration-500"
          />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-6 font-semibold text-prime-light text-sm uppercase [&_a]:transition-all [&_a]:duration-500 [&_a]:hover:text-prime-red">
            {ANCHORS.map(({ hash, label }) => (
              <Link key={hash} href={isHome ? hash : `/${hash}`}>
                {label}
              </Link>
            ))}

            {/* Blog oculto na master — reativar quando for ao ar. */}
            {/* Rota real, não âncora. */}
            {/* <Link href="/blog">Blog</Link> */}
          </nav>

          {/* Área logada oculta na master — reativar quando for ao ar. */}
          {/* <Link
            href="/login"
            className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-prime-red px-5 font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
          >
            <UserIcon className="size-5" weight="bold" />
            Entrar
          </Link> */}
        </div>

        <MenuMobileTrigger>
          <button type="button" className="lg:hidden">
            <ListIcon className="size-7 text-prime-light" />
          </button>
        </MenuMobileTrigger>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { hash: "#quem-somos", label: "Quem Somos" },
  { hash: "#o-que-fazemos", label: "O que Fazemos" },
  { hash: "#head-coaches", label: "Head Coaches" },
  { hash: "#instrutores", label: "Instrutores" },
  { hash: "#evolucao", label: "Evolução" },
  { hash: "#faca-parte", label: "Faça parte" },
];

/**
 * Fora da home os alvos não existem no DOM: o link precisa levar à home
 * antes de rolar. Mesma regra do header.
 */
export function SectionLinks() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  return (
    <ul className="mt-4 flex flex-col gap-2 text-prime-light/70 text-sm">
      {SECTIONS.map(({ hash, label }) => (
        <li key={hash}>
          <Link
            href={isHome ? hash : `/${hash}`}
            className="transition-colors duration-500 hover:text-prime-red"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Secao } from "@/utils/rich-content";

/**
 * Índice do artigo.
 *
 * As seções vêm prontas do servidor (extraídas do HTML junto com as âncoras),
 * então a lista aparece no primeiro paint. O que roda no cliente é só o
 * destaque da seção atual, por `IntersectionObserver` — sem listener de
 * scroll, que dispararia dezenas de vezes por segundo.
 */
export function TableOfContents({ secoes }: { secoes: Array<Secao> }) {
  const [ativa, setAtiva] = useState(secoes[0]?.id);

  useEffect(() => {
    const alvos = secoes
      .map((secao) => document.getElementById(secao.id))
      .filter((elemento): elemento is HTMLElement => Boolean(elemento));

    if (alvos.length === 0) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        // A janela inteira pode conter várias seções: vale a que está mais
        // acima entre as visíveis.
        const visivel = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (visivel) setAtiva(visivel.target.id);
      },
      // A faixa estreita no topo transforma "entrou na tela" em "chegou ao
      // topo da leitura", que é o que o índice deve refletir.
      { rootMargin: "-120px 0px -70% 0px" },
    );

    for (const alvo of alvos) observer.observe(alvo);

    return () => observer.disconnect();
  }, [secoes]);

  // Um item só não é navegação: sem dois destinos, o índice não entra.
  if (secoes.length < 2) return null;

  return (
    <nav
      aria-label="Neste artigo"
      className="rounded-xl border border-white/10 bg-white/3 p-5"
    >
      <strong className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
        Neste artigo
      </strong>

      <ul className="mt-4 flex flex-col gap-3">
        {secoes.map((secao) => (
          <li key={secao.id}>
            <a
              href={`#${secao.id}`}
              aria-current={ativa === secao.id ? "location" : undefined}
              className={twMerge(
                "block leading-snug transition-colors duration-300",
                // O recuo do segundo nível mostra a hierarquia do artigo.
                secao.nivel === 3 ? "pl-3 text-xs" : "text-sm",
                ativa === secao.id
                  ? "font-semibold text-prime-red"
                  : "text-prime-light/60 hover:text-prime-light",
              )}
            >
              {secao.titulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Section } from "@/utils/rich-content";

/**
 * Índice do artigo.
 *
 * As seções vêm prontas do servidor (extraídas do HTML junto com as âncoras),
 * então a lista aparece no primeiro paint. O que roda no cliente é só o
 * destaque da seção atual, por `IntersectionObserver` — sem listener de
 * scroll, que dispararia dezenas de vezes por segundo.
 */
export function TableOfContents({ sections }: { sections: Array<Section> }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // A janela inteira pode conter várias seções: vale a que está mais
        // acima entre as visíveis.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (visible) setActive(visible.target.id);
      },
      // A faixa estreita no topo transforma "entrou na tela" em "chegou ao
      // topo da leitura", que é o que o índice deve refletir.
      { rootMargin: "-120px 0px -70% 0px" },
    );

    for (const target of targets) observer.observe(target);

    return () => observer.disconnect();
  }, [sections]);

  // Um item só não é navegação: sem dois destinos, o índice não entra.
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Neste artigo"
      className="rounded-xl border border-white/10 bg-white/3 p-5"
    >
      <strong className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
        Neste artigo
      </strong>

      <ul className="mt-4 flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className={twMerge(
                "block leading-snug transition-colors duration-300",
                // O recuo do segundo nível mostra a hierarquia do artigo.
                section.level === 3 ? "pl-3 text-xs" : "text-sm",
                active === section.id
                  ? "font-semibold text-prime-red"
                  : "text-prime-light/60 hover:text-prime-light",
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

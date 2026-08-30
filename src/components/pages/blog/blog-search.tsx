"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

/** Espera de digitação antes de ir ao servidor. */
const DEBOUNCE_MS = 350;

/**
 * Campo de busca do blog.
 *
 * A busca é resolvida pelo WordPress, não aqui: o input só escreve `?q=` na
 * URL e o servidor responde com a página filtrada. O modelo anterior baixava
 * o acervo inteiro para filtrar em memória — instantâneo com 10 posts,
 * inviável com 500.
 *
 * A URL ser o estado traz de graça o compartilhamento do link, o botão voltar
 * e o resultado renderizado no servidor.
 */
export function BlogSearch({ placeholder }: { placeholder?: string }) {
  const searchId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inicial = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(inicial);
  const [pending, startTransition] = useTransition();

  // Guarda o que já está na URL para não navegar de novo ao montar nem quando
  // a própria navegação devolve o valor que acabamos de escrever.
  const ultimoEnviado = useRef(inicial);

  useEffect(() => {
    if (term === ultimoEnviado.current) return;

    const timeout = setTimeout(() => {
      ultimoEnviado.current = term;

      const params = new URLSearchParams(searchParams);
      if (term.trim()) {
        params.set("q", term.trim());
      } else {
        params.delete("q");
      }
      // Buscar sempre recomeça na primeira página.
      params.delete("p");

      const query = params.toString();

      startTransition(() => {
        // `replace` e não `push`: cada tecla digitada não deve virar uma
        // entrada no histórico do navegador.
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, pathname, router, searchParams]);

  return (
    <search>
      <label htmlFor={searchId} className="sr-only">
        Buscar artigos
      </label>

      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-prime-light/40"
          aria-hidden="true"
        />

        <input
          id={searchId}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder ?? "Buscar por tema ou palavra-chave..."}
          data-pending={pending || undefined}
          className="h-14 w-full rounded-xl border border-white/10 bg-white/3 pr-12 pl-12 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60 data-pending:opacity-70 lg:text-base"
        />

        {term && (
          <button
            type="button"
            onClick={() => setTerm("")}
            aria-label="Limpar busca"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-prime-light/40 transition-colors duration-500 hover:text-prime-light"
          >
            <XIcon className="size-5" />
          </button>
        )}
      </div>
    </search>
  );
}

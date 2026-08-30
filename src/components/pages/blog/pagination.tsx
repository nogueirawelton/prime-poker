import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

/** Página 1 mora em `/blog`; as demais em `/blog/pagina/N`. */
function defaultHref(page: number) {
  return page <= 1 ? "/blog" : `/blog/pagina/${page}`;
}

/**
 * Janela de páginas em volta da atual.
 *
 * Listar todas funcionava com 3 páginas e vira um paredão com 50. `null`
 * marca onde entra a reticência.
 */
function janela(current: number, total: number): Array<number | null> {
  const RAIO = 1;
  const paginas = new Set<number>([1, total]);

  for (let p = current - RAIO; p <= current + RAIO; p++) {
    if (p >= 1 && p <= total) paginas.add(p);
  }

  const ordenadas = [...paginas].sort((a, b) => a - b);
  const saida: Array<number | null> = [];

  for (const [indice, pagina] of ordenadas.entries()) {
    const anterior = ordenadas[indice - 1];
    if (anterior !== undefined && pagina - anterior > 1) saida.push(null);
    saida.push(pagina);
  }

  return saida;
}

export function Pagination({
  current,
  total,
  hrefFor = defaultHref,
}: {
  current: number;
  total: number;
  /** Permite reaproveitar a paginação em categorias e na busca. */
  hrefFor?: (page: number) => string;
}) {
  if (total <= 1) return null;

  const base =
    "grid h-11 min-w-11 place-items-center rounded-md border px-3 font-semibold text-sm transition-all duration-500";

  return (
    <nav aria-label="Paginação" className="mt-12 flex justify-center gap-2">
      {current > 1 && (
        <Link
          href={hrefFor(current - 1)}
          rel="prev"
          aria-label="Página anterior"
          className={twMerge(base, "border-white/15 text-prime-light")}
        >
          <CaretLeftIcon className="size-4" weight="bold" />
        </Link>
      )}

      {janela(current, total).map((page, indice) =>
        page === null ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: reticência não tem id
            key={`gap-${indice}`}
            aria-hidden="true"
            className="grid h-11 place-items-center px-1 text-prime-light/40"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-current={page === current ? "page" : undefined}
            className={twMerge(
              base,
              page === current
                ? "border-prime-red bg-prime-red text-prime-light"
                : "border-white/15 text-prime-light/70 hover:border-white/40 hover:text-prime-light",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {current < total && (
        <Link
          href={hrefFor(current + 1)}
          rel="next"
          aria-label="Próxima página"
          className={twMerge(base, "border-white/15 text-prime-light")}
        >
          <CaretRightIcon className="size-4" weight="bold" />
        </Link>
      )}
    </nav>
  );
}

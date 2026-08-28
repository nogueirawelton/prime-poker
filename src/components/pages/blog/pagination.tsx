import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

/** Página 1 mora em `/blog`; as demais em `/blog/pagina/N`. */
function hrefFor(page: number) {
  return page <= 1 ? "/blog" : `/blog/pagina/${page}`;
}

export function Pagination({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, index) => index + 1);

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

      {pages.map((page) => (
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
      ))}

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

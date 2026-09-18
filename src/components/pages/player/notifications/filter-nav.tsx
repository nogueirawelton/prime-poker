import Link from "next/link";
import { twMerge } from "tailwind-merge";
import {
  FILTER_LABEL,
  FILTERS,
  type NotificationFilter,
} from "@/services/notifications";

/**
 * Todas / Não lidas / Lidas.
 *
 * Links, não botões: o filtro é estado de URL, então a seleção sobrevive ao
 * recarregar e ao botão voltar — e não precisa de JavaScript para funcionar.
 */
export function FilterNav({ current }: { current: NotificationFilter }) {
  return (
    <nav aria-label="Filtrar notificações" className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Link
          key={filter}
          href={
            filter === "todas"
              ? "/player/notificacoes"
              : `/player/notificacoes?filtro=${filter}`
          }
          aria-current={current === filter ? "page" : undefined}
          className={twMerge(
            "rounded-full border px-4 py-2 font-semibold text-xs uppercase transition-all duration-300",
            current === filter
              ? "border-prime-red bg-prime-red/15 text-prime-light"
              : "border-white/15 text-prime-light/70 hover:border-white/40 hover:text-prime-light",
          )}
        >
          {FILTER_LABEL[filter]}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import {
  FILTRO_LABEL,
  FILTROS,
  type FiltroNotificacao,
} from "@/services/notificacoes";

/**
 * Todas / Não lidas / Lidas.
 *
 * Links, não botões: o filtro é estado de URL, então a seleção sobrevive ao
 * recarregar e ao botão voltar — e não precisa de JavaScript para funcionar.
 */
export function FiltroNav({ atual }: { atual: FiltroNotificacao }) {
  return (
    <nav aria-label="Filtrar notificações" className="flex flex-wrap gap-2">
      {FILTROS.map((filtro) => (
        <Link
          key={filtro}
          href={
            filtro === "todas"
              ? "/player/notificacoes"
              : `/player/notificacoes?filtro=${filtro}`
          }
          aria-current={atual === filtro ? "page" : undefined}
          className={twMerge(
            "rounded-full border px-4 py-2 font-semibold text-xs uppercase transition-all duration-300",
            atual === filtro
              ? "border-prime-red bg-prime-red/15 text-prime-light"
              : "border-white/15 text-prime-light/70 hover:border-white/40 hover:text-prime-light",
          )}
        >
          {FILTRO_LABEL[filtro]}
        </Link>
      ))}
    </nav>
  );
}

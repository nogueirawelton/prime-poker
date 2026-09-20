import type { ReactNode } from "react";

/**
 * Aparência dos campos do perfil.
 *
 * Mora aqui, e não nos componentes de `ui/form`, porque aqueles são
 * estilizados para o fundo claro da landing; a área do jogador é escura.
 */
export const FIELD_CLASS =
  "h-12 w-full rounded-lg border border-white/10 bg-white/3 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60";

/** Rótulo em cima, campo embaixo — a forma de todos os campos do perfil. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide"
      >
        {label}
      </label>

      {children}

      {hint && <small className="text-prime-light/40 text-xs">{hint}</small>}
    </div>
  );
}

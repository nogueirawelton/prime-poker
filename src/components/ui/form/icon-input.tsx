"use client";

import type { Icon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IconInputProps extends ComponentProps<"input"> {
  /** Ícone à esquerda, apenas decorativo. */
  icon: Icon;
  /** Slot à direita: usado para ações como mostrar/ocultar a senha. */
  action?: ReactNode;
  /** Mensagem de erro já pronta para exibição. */
  error?: string;
}

export function IconInput({
  icon: LeadingIcon,
  action,
  error,
  className,
  ...props
}: IconInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <LeadingIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-prime-light/40"
        />

        <input
          {...props}
          aria-invalid={Boolean(error)}
          className={twMerge(
            "h-14 w-full rounded-md border border-white/10 bg-white/5 pl-12 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60",
            // Sem ação à direita o texto pode ocupar todo o espaço restante.
            action ? "pr-12" : "pr-4",
            error && "border-prime-red/60",
            className,
          )}
        />

        {action && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            {action}
          </div>
        )}
      </div>

      {error && (
        <small role="alert" className="text-prime-red text-xs">
          {error}
        </small>
      )}
    </div>
  );
}

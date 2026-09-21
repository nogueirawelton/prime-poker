"use client";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { Select as SelectPrimitive } from "radix-ui";

export type SelectOption = { value: string; label: string };

/** Aparência padrão do gatilho: mesma altura e borda dos campos ao lado. */
const CONTROL =
  "h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-prime-light text-sm outline-none transition-colors duration-500 focus:border-prime-red/60";

/**
 * "Nada escolhido" precisa de um valor de verdade: o Radix recusa `Item` com
 * valor vazio, porque é assim que ele representa a ausência de escolha.
 */
const EMPTY = "__vazio";

/**
 * Select do Radix no lugar do `<select>` nativo, para as telas escuras.
 *
 * O nativo abre uma lista desenhada pelo sistema, que ignora o tema escuro do
 * site (chegou a sair texto branco no branco). Este usa o mesmo visual do
 * painel de filtros e do menu dos cards, e mantém teclado e leitor de tela a
 * cargo do Radix.
 *
 * Nasceu dentro do painel de filtros das aulas e saiu de lá quando o diálogo
 * de upgrade precisou do mesmo controle: duas cópias divergiriam na primeira
 * vez que uma das duas mudasse de cor.
 *
 * O `placeholder` só aparece quando `value` é vazio, e serve ao caso em que
 * escolher é obrigatório; no painel de filtros, o "vazio" é a própria opção
 * "Todas as trilhas", que entra como mais um item da lista.
 */
export function DarkSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  triggerClass,
  contentClass,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  options: Array<SelectOption>;
  /** Para leitor de tela: o campo nem sempre tem `<label>` associado. */
  label: string;
  placeholder?: string;
  triggerClass?: string;
  contentClass?: string;
}) {
  return (
    <SelectPrimitive.Root
      value={value || EMPTY}
      onValueChange={(nextValue) =>
        onChange(nextValue === EMPTY ? "" : nextValue)
      }
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={`${triggerClass ?? CONTROL} flex cursor-pointer items-center justify-between gap-2 text-left data-[state=open]:border-prime-red/60`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <CaretDownIcon
            className="size-4 shrink-0 text-prime-light/50"
            weight="bold"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        {/* Acima do painel ou do diálogo que o abriu. */}
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={`z-60 max-h-64 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open ${contentClass ?? ""}`}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value || EMPTY}
                value={option.value || EMPTY}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-prime-light/80 text-sm outline-none transition-colors duration-300 data-highlighted:bg-prime-red/15 data-highlighted:text-prime-red"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>

                <SelectPrimitive.ItemIndicator>
                  <CheckIcon className="size-4" weight="bold" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

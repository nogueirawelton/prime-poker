"use client";

import {
  ArrowsClockwiseIcon,
  MagnifyingGlassIcon,
  SlidersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Popover } from "radix-ui";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { PARAMS } from "@/lib/lessons-params";
import {
  INSTRUCTORS,
  ORDER_LABEL,
  SORT_ORDERS,
  TRACKS,
} from "@/services/lessons";

/** Espera de digitação antes de ir ao servidor. */
const DEBOUNCE_MS = 350;

/** Parâmetros que o "Limpar filtros" zera — a busca digitada não é filtro. */
const FILTERABLE = [
  PARAMS.track,
  PARAMS.instructor,
  PARAMS.from,
  PARAMS.to,
  PARAMS.order,
];

/**
 * Busca do acervo e o painel de filtros ao lado.
 *
 * Ordenação e filtros não ficam em dropdowns soltos acima da grade: moram
 * todos dentro deste painel, que abre pelo botão à direita da busca. Assim a
 * listagem tem um controle só, e o selo no botão diz quantos filtros estão
 * ativos sem precisar abrir.
 *
 * Como no blog, o estado vive na URL — o servidor devolve o primeiro lote já
 * filtrado e o link continua compartilhável. A partição é o mesmo `?cat=` que
 * a sidebar controla, então escolher aqui acende a trilha lá.
 */
export function LessonsSearch({ activeFilters }: { activeFilters: number }) {
  const searchId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = searchParams.get(PARAMS.search) ?? "";
  const [term, setTerm] = useState(initial);
  const [pending, startTransition] = useTransition();

  // Guarda o que já está na URL para não navegar ao montar nem quando a
  // própria navegação devolve o valor que acabamos de escrever.
  const lastSubmitted = useRef(initial);

  function navigate(params: URLSearchParams) {
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  /** Escreve (ou remove, quando `nextValue` é vazio) um parâmetro da listagem. */
  function applyFilter(paramName: string, nextValue: string) {
    const params = new URLSearchParams(searchParams);

    if (nextValue) {
      params.set(paramName, nextValue);
    } else {
      params.delete(paramName);
    }

    navigate(params);
  }

  function clear() {
    const params = new URLSearchParams(searchParams);
    for (const paramName of FILTERABLE) params.delete(paramName);

    navigate(params);
  }

  useEffect(() => {
    if (term === lastSubmitted.current) return;

    const timeout = setTimeout(() => {
      lastSubmitted.current = term;

      const params = new URLSearchParams(searchParams);
      if (term.trim()) {
        params.set(PARAMS.search, term.trim());
      } else {
        params.delete(PARAMS.search);
      }

      const query = params.toString();

      startTransition(() => {
        // `replace` e não `push`: cada tecla não deve virar entrada no
        // histórico do navegador.
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, pathname, router, searchParams]);

  const from = searchParams.get(PARAMS.from) ?? "";
  const to = searchParams.get(PARAMS.to) ?? "";

  return (
    <div className="flex items-center gap-3">
      <search className="flex-1">
        <label htmlFor={searchId} className="sr-only">
          Buscar aulas
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
            placeholder="Buscar por título, tema, palavra-chave, instrutor..."
            data-pending={pending || undefined}
            className="h-14 w-full rounded-xl border border-white/10 bg-white/3 pr-12 pl-12 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60 data-pending:opacity-70"
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

      <Popover.Root>
        <Popover.Trigger
          aria-label="Filtros da listagem"
          className="relative flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-prime-light/70 transition-all duration-500 hover:border-white/30 hover:text-prime-light data-[state=open]:border-prime-red/60 data-[state=open]:text-prime-light"
        >
          <SlidersIcon className="size-5" weight="bold" />

          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-prime-red font-bold text-[10px] text-prime-light">
              {activeFilters}
            </span>
          )}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            className="z-50 flex w-80 flex-col gap-5 rounded-xl border border-white/10 bg-prime-darkgray p-5 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
          >
            <Field label="Partição">
              <Select
                value={searchParams.get(PARAMS.track) ?? ""}
                onChange={(nextValue) => applyFilter(PARAMS.track, nextValue)}
              >
                <option value="">Todas as partições</option>
                {TRACKS.map((track) => (
                  <option key={track.slug} value={track.slug}>
                    {track.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Data">
              {/* Empilhados, não lado a lado: o `input[type=date]` tem largura
                  intrínseca do calendário nativo e dois deles não cabem na
                  largura do painel — quebravam em cima do traço. */}
              <div className="flex flex-col gap-2">
                <DateField
                  label="De"
                  value={from}
                  max={to || undefined}
                  onChange={(nextValue) => applyFilter(PARAMS.from, nextValue)}
                />

                <DateField
                  label="Até"
                  value={to}
                  min={from || undefined}
                  onChange={(nextValue) => applyFilter(PARAMS.to, nextValue)}
                />
              </div>
            </Field>

            <Field label="Instrutor">
              <Select
                value={searchParams.get(PARAMS.instructor) ?? ""}
                onChange={(nextValue) =>
                  applyFilter(PARAMS.instructor, nextValue)
                }
              >
                <option value="">Todos os instrutores</option>
                {INSTRUCTORS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Ordenar por">
              <Select
                value={searchParams.get(PARAMS.order) ?? "recentes"}
                onChange={(nextValue) =>
                  applyFilter(
                    PARAMS.order,
                    nextValue === "recentes" ? "" : nextValue,
                  )
                }
              >
                {SORT_ORDERS.map((nextValue) => (
                  <option key={nextValue} value={nextValue}>
                    {ORDER_LABEL[nextValue]}
                  </option>
                ))}
              </Select>
            </Field>

            <button
              type="button"
              onClick={clear}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/20 font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
            >
              <ArrowsClockwiseIcon className="size-4" weight="bold" />
              Limpar filtros
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}

const CONTROL =
  "h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-prime-light text-sm outline-none transition-colors duration-500 focus:border-prime-red/60";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  children: React.ReactNode;
}) {
  return (
    // `<select>` nativo: o menu do sistema já resolve teclado, toque e listas
    // longas melhor do que um dropdown desenhado à mão.
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${CONTROL} cursor-pointer`}
    >
      {children}
    </select>
  );
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (nextValue: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 focus-within:border-prime-red/60">
      <label
        htmlFor={id}
        className="w-8 shrink-0 font-semibold text-[11px] text-prime-light/50 uppercase"
      >
        {label}
      </label>

      {/* `min`/`max` cruzados impedem, no próprio calendário, um intervalo
          invertido — que o servidor descartaria em silêncio. */}
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 flex-1 bg-transparent text-prime-light text-sm outline-none [color-scheme:dark]"
      />
    </div>
  );
}

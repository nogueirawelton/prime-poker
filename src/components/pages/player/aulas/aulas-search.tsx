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
import { PARAMS } from "@/lib/aulas-params";
import { CATEGORIAS, INSTRUTORES, ORDEM_LABEL, ORDENS } from "@/services/aulas";

/** Espera de digitação antes de ir ao servidor. */
const DEBOUNCE_MS = 350;

/** Parâmetros que o "Limpar filtros" zera — a busca digitada não é filtro. */
const FILTRAVEIS = [
  PARAMS.categoria,
  PARAMS.instrutor,
  PARAMS.de,
  PARAMS.ate,
  PARAMS.ordem,
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
export function AulasSearch({ filtrosAtivos }: { filtrosAtivos: number }) {
  const buscaId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inicial = searchParams.get(PARAMS.busca) ?? "";
  const [termo, setTermo] = useState(inicial);
  const [pendente, startTransition] = useTransition();

  // Guarda o que já está na URL para não navegar ao montar nem quando a
  // própria navegação devolve o valor que acabamos de escrever.
  const ultimoEnviado = useRef(inicial);

  function navegar(params: URLSearchParams) {
    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  /** Escreve (ou remove, quando `valor` é vazio) um parâmetro da listagem. */
  function definir(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams);

    if (valor) {
      params.set(chave, valor);
    } else {
      params.delete(chave);
    }

    navegar(params);
  }

  function limpar() {
    const params = new URLSearchParams(searchParams);
    for (const chave of FILTRAVEIS) params.delete(chave);

    navegar(params);
  }

  useEffect(() => {
    if (termo === ultimoEnviado.current) return;

    const timeout = setTimeout(() => {
      ultimoEnviado.current = termo;

      const params = new URLSearchParams(searchParams);
      if (termo.trim()) {
        params.set(PARAMS.busca, termo.trim());
      } else {
        params.delete(PARAMS.busca);
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
  }, [termo, pathname, router, searchParams]);

  const de = searchParams.get(PARAMS.de) ?? "";
  const ate = searchParams.get(PARAMS.ate) ?? "";

  return (
    <div className="flex items-center gap-3">
      <search className="flex-1">
        <label htmlFor={buscaId} className="sr-only">
          Buscar aulas
        </label>

        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-prime-light/40"
            aria-hidden="true"
          />

          <input
            id={buscaId}
            type="search"
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            placeholder="Buscar por título, tema, palavra-chave, instrutor..."
            data-pending={pendente || undefined}
            className="h-14 w-full rounded-xl border border-white/10 bg-white/3 pr-12 pl-12 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60 data-pending:opacity-70"
          />

          {termo && (
            <button
              type="button"
              onClick={() => setTermo("")}
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

          {filtrosAtivos > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-prime-red font-bold text-[10px] text-prime-light">
              {filtrosAtivos}
            </span>
          )}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            className="z-50 flex w-80 flex-col gap-5 rounded-xl border border-white/10 bg-prime-darkgray p-5 shadow-2xl data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open"
          >
            <Campo rotulo="Partição">
              <Select
                value={searchParams.get(PARAMS.categoria) ?? ""}
                onChange={(valor) => definir(PARAMS.categoria, valor)}
              >
                <option value="">Todas as partições</option>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria.slug} value={categoria.slug}>
                    {categoria.nome}
                  </option>
                ))}
              </Select>
            </Campo>

            <Campo rotulo="Data">
              {/* Empilhados, não lado a lado: o `input[type=date]` tem largura
                  intrínseca do calendário nativo e dois deles não cabem na
                  largura do painel — quebravam em cima do traço. */}
              <div className="flex flex-col gap-2">
                <Data
                  rotulo="De"
                  value={de}
                  max={ate || undefined}
                  onChange={(valor) => definir(PARAMS.de, valor)}
                />

                <Data
                  rotulo="Até"
                  value={ate}
                  min={de || undefined}
                  onChange={(valor) => definir(PARAMS.ate, valor)}
                />
              </div>
            </Campo>

            <Campo rotulo="Instrutor">
              <Select
                value={searchParams.get(PARAMS.instrutor) ?? ""}
                onChange={(valor) => definir(PARAMS.instrutor, valor)}
              >
                <option value="">Todos os instrutores</option>
                {INSTRUTORES.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </Select>
            </Campo>

            <Campo rotulo="Ordenar por">
              <Select
                value={searchParams.get(PARAMS.ordem) ?? "recentes"}
                onChange={(valor) =>
                  definir(PARAMS.ordem, valor === "recentes" ? "" : valor)
                }
              >
                {ORDENS.map((valor) => (
                  <option key={valor} value={valor}>
                    {ORDEM_LABEL[valor]}
                  </option>
                ))}
              </Select>
            </Campo>

            <button
              type="button"
              onClick={limpar}
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

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide">
        {rotulo}
      </span>
      {children}
    </div>
  );
}

const CONTROLE =
  "h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-prime-light text-sm outline-none transition-colors duration-500 focus:border-prime-red/60";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (valor: string) => void;
  children: React.ReactNode;
}) {
  return (
    // `<select>` nativo: o menu do sistema já resolve teclado, toque e listas
    // longas melhor do que um dropdown desenhado à mão.
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${CONTROLE} cursor-pointer`}
    >
      {children}
    </select>
  );
}

function Data({
  rotulo,
  value,
  min,
  max,
  onChange,
}: {
  rotulo: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (valor: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 focus-within:border-prime-red/60">
      <label
        htmlFor={id}
        className="w-8 shrink-0 font-semibold text-[11px] text-prime-light/50 uppercase"
      >
        {rotulo}
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

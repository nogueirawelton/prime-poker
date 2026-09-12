"use client";

import { SpinnerGapIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { carregarAulas } from "@/actions/aulas";
import type { AulasSearchParams } from "@/lib/aulas-params";
import type { Aula } from "@/services/aulas";
import { AulaCard } from "./aula-card";
import { GRID } from "./grid";

/** Distância em que o sentinela começa a carregar o próximo lote. */
const MARGEM = "600px";

type Props = {
  /** Primeiro lote, renderizado no servidor. */
  inicial: Array<Aula>;
  temMais: boolean;
  /** Parâmetros crus da URL: a action revalida antes de consultar. */
  params: AulasSearchParams;
};

/**
 * Listagem com rolagem infinita.
 *
 * O primeiro lote vem pronto do servidor (aparece sem JavaScript e sem
 * layout shift); os seguintes chegam por Server Function quando o sentinela
 * entra em cena.
 *
 * O estado é recriado a cada mudança de filtro porque a página monta este
 * componente com `key` derivada da URL — sem isso os resultados do filtro
 * anterior continuariam acumulados na lista.
 */
export function AulasLista({ inicial, temMais, params }: Props) {
  const [aulas, setAulas] = useState(inicial);
  const [pagina, setPagina] = useState(1);
  const [fim, setFim] = useState(!temMais);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  const sentinela = useRef<HTMLDivElement>(null);

  const carregarMais = useCallback(async () => {
    setCarregando(true);
    setErro(false);

    try {
      const proxima = pagina + 1;
      const resultado = await carregarAulas(params, proxima);

      // Concatena em vez de substituir: a rolagem infinita é acumulativa.
      setAulas((atuais) => [...atuais, ...resultado.aulas]);
      setPagina(proxima);
      if (!resultado.temMais) setFim(true);
    } catch {
      // Sem lote novo, o observer pararia de disparar: o botão de "tentar
      // de novo" é a única saída para quem perdeu a conexão no meio.
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, [pagina, params]);

  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || fim || erro) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) carregarMais();
      },
      { rootMargin: MARGEM },
    );

    observer.observe(alvo);

    return () => observer.disconnect();
  }, [carregarMais, fim, erro]);

  return (
    <>
      <div className={GRID}>
        {aulas.map((aula) => (
          <AulaCard key={aula.id} aula={aula} />
        ))}
      </div>

      {/* `aria-live`: quem usa leitor de tela precisa saber que a lista cresceu. */}
      <div aria-live="polite" className="flex justify-center py-10">
        {!fim && !erro && (
          <div ref={sentinela} className="flex items-center gap-2">
            {carregando && (
              <>
                <SpinnerGapIcon className="size-5 animate-spin text-prime-red" />
                <span className="text-prime-light/60 text-sm">
                  Carregando mais aulas...
                </span>
              </>
            )}
          </div>
        )}

        {erro && (
          <button
            type="button"
            onClick={carregarMais}
            className="h-11 rounded-md border border-white/20 px-5 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
          >
            Não foi possível carregar. Tentar de novo
          </button>
        )}

        {fim && aulas.length > 0 && (
          <p className="text-prime-light/40 text-sm">
            Você chegou ao fim do acervo.
          </p>
        )}
      </div>
    </>
  );
}

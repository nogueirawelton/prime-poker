"use client";

import { SpinnerGapIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadLessons } from "@/actions/lessons";
import type { Lesson } from "@/lib/lessons";
import type { LessonsSearchParams } from "@/lib/lessons-params";
import { GRID } from "./grid";
import { LessonCard } from "./lesson-card";

/** Distância em que o sentinela começa a carregar o próximo lote. */
const MARGIN = "600px";

type Props = {
  /** Primeiro lote, renderizado no servidor. */
  initial: Array<Lesson>;
  hasMore: boolean;
  /** Parâmetros crus da URL: a action revalida antes de consultar. */
  params: LessonsSearchParams;
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
export function LessonsList({ initial, hasMore, params }: Props) {
  const [lessons, setLessons] = useState(initial);
  const [page, setPage] = useState(1);
  const [reachedEnd, setReachedEnd] = useState(!hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const nextPage = page + 1;
      const result = await loadLessons(params, nextPage);

      // Concatena em vez de substituir: a rolagem infinita é acumulativa.
      setLessons((currentItems) => [...currentItems, ...result.lessons]);
      setPage(nextPage);
      if (!result.hasMore) setReachedEnd(true);
    } catch {
      // Sem lote novo, o observer pararia de disparar: o botão de "tentar
      // de novo" é a única saída para quem perdeu a conexão no meio.
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, params]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || reachedEnd || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: MARGIN },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, reachedEnd, error]);

  return (
    <>
      <div className={GRID}>
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {/* `aria-live`: quem usa leitor de tela precisa saber que a lista cresceu. */}
      <div aria-live="polite" className="flex justify-center py-10">
        {!reachedEnd && !error && (
          <div ref={sentinel} className="flex items-center gap-2">
            {loading && (
              <>
                <SpinnerGapIcon className="size-5 animate-spin text-prime-red" />
                <span className="text-prime-light/60 text-sm">
                  Carregando mais aulas...
                </span>
              </>
            )}
          </div>
        )}

        {error && (
          <button
            type="button"
            onClick={loadMore}
            className="h-11 rounded-md border border-white/20 px-5 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
          >
            Não foi possível carregar. Tentar de novo
          </button>
        )}

        {reachedEnd && lessons.length > 0 && (
          <p className="text-prime-light/40 text-sm">
            Você chegou ao fim do acervo.
          </p>
        )}
      </div>
    </>
  );
}

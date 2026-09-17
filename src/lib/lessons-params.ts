import {
  INSTRUCTORS,
  type LessonFilter,
  SORT_ORDERS,
  type SortOrder,
  TRACKS,
  type TrackSlug,
} from "@/services/lessons";

/** Nomes dos parâmetros na URL — a mesma tabela serve leitura e escrita. */
export const PARAMS = {
  search: "q",
  track: "cat",
  instructor: "instrutor",
  from: "de",
  to: "ate",
  order: "ordem",
} as const;

/** Formato cru do `searchParams` da página. */
export type LessonsSearchParams = Partial<
  Record<(typeof PARAMS)[keyof typeof PARAMS], string | Array<string>>
>;

function first(value: string | Array<string> | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

/** Só aceita valor que exista na lista; o resto é descartado sem erro. */
function oneOf<T extends string>(
  value: string | Array<string> | undefined,
  allowed: ReadonlyArray<T>,
): T | undefined {
  const text = first(value);
  return allowed.includes(text as T) ? (text as T) : undefined;
}

/** `AAAA-MM-DD` e nada além disso: o valor vai direto para a comparação. */
function data(value: string | Array<string> | undefined) {
  const text = first(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
}

const SLUGS = TRACKS.map((track) => track.slug);

/**
 * Converte a URL no filtro do serviço.
 *
 * A URL é a fonte da verdade da listagem: link compartilhável, botão voltar e
 * o primeiro lote já renderizado no servidor saem de graça disso.
 */
export function parseFilter(params: LessonsSearchParams): LessonFilter {
  const from = data(params[PARAMS.from]);
  const to = data(params[PARAMS.to]);

  return {
    search: first(params[PARAMS.search]),
    track: oneOf<TrackSlug>(params[PARAMS.track], SLUGS),
    instructor: oneOf(params[PARAMS.instructor], INSTRUCTORS),
    // Intervalo invertido é entrada em construção, não filtro: ignorado até
    // o segundo campo fazer sentido.
    from: !from || !to || from <= to ? from : undefined,
    to: !from || !to || from <= to ? to : undefined,
    order: oneOf<SortOrder>(params[PARAMS.order], SORT_ORDERS) ?? "recentes",
  };
}

/**
 * Quantos filtros estão ativos — alimenta o selo do botão de configurações.
 *
 * A ordenação não entra: ela tem sempre um valor, e um selo permanente não
 * diria nada. O intervalo de datas conta como um só.
 */
export function countFilters(filter: LessonFilter) {
  return [filter.track, filter.instructor, filter.from || filter.to].filter(
    Boolean,
  ).length;
}

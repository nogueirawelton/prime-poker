import {
  LEVELS,
  type LessonFilter,
  type Level,
  SORT_ORDERS,
  type SortOrder,
} from "@/lib/lessons";

/** Nomes dos parâmetros na URL — a mesma tabela serve leitura e escrita. */
export const PARAMS = {
  search: "q",
  track: "cat",
  instructor: "instrutor",
  tier: "plano",
  level: "nivel",
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

/**
 * Slug de trilha: só o formato. Uma trilha inexistente não é erro — o
 * WordPress devolve a lista vazia e a página diz que não achou nada.
 */
function slug(value: string | Array<string> | undefined) {
  const text = first(value);
  return text && /^[a-z0-9-]{1,200}$/.test(text) ? text : undefined;
}

/**
 * Slug de tier. Só o formato — um tier inexistente devolve lista vazia, como
 * acontece com uma trilha que não existe.
 */
function tier(value: string | Array<string> | undefined) {
  const text = first(value);
  return text && /^[a-z_]{1,40}$/.test(text) ? text : undefined;
}

/** ID do instrutor no WordPress. */
function id(value: string | Array<string> | undefined) {
  const text = first(value);
  return text && /^\d{1,10}$/.test(text) ? Number(text) : undefined;
}

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
    track: slug(params[PARAMS.track]),
    instructor: id(params[PARAMS.instructor]),
    // Slug de tier (`player_gold`): o sublinhado não passa no `slug()`.
    tier: tier(params[PARAMS.tier]),
    level: oneOf<Level>(params[PARAMS.level], LEVELS),
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
  return [
    filter.track,
    filter.instructor,
    filter.tier,
    filter.level,
    filter.from || filter.to,
  ].filter(Boolean).length;
}

import {
  CATEGORIAS,
  type CategoriaSlug,
  type FiltroAulas,
  INSTRUTORES,
  ORDENS,
  type Ordem,
} from "@/services/aulas";

/** Nomes dos parâmetros na URL — a mesma tabela serve leitura e escrita. */
export const PARAMS = {
  busca: "q",
  categoria: "cat",
  instrutor: "instrutor",
  de: "de",
  ate: "ate",
  ordem: "ordem",
} as const;

/** Formato cru do `searchParams` da página. */
export type AulasSearchParams = Partial<
  Record<(typeof PARAMS)[keyof typeof PARAMS], string | Array<string>>
>;

function primeiro(valor: string | Array<string> | undefined) {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto?.trim() || undefined;
}

/** Só aceita valor que exista na lista; o resto é descartado sem erro. */
function umDe<T extends string>(
  valor: string | Array<string> | undefined,
  permitidos: ReadonlyArray<T>,
): T | undefined {
  const texto = primeiro(valor);
  return permitidos.includes(texto as T) ? (texto as T) : undefined;
}

/** `AAAA-MM-DD` e nada além disso: o valor vai direto para a comparação. */
function data(valor: string | Array<string> | undefined) {
  const texto = primeiro(valor);
  return texto && /^\d{4}-\d{2}-\d{2}$/.test(texto) ? texto : undefined;
}

const SLUGS = CATEGORIAS.map((categoria) => categoria.slug);

/**
 * Converte a URL no filtro do serviço.
 *
 * A URL é a fonte da verdade da listagem: link compartilhável, botão voltar e
 * o primeiro lote já renderizado no servidor saem de graça disso.
 */
export function parseFiltro(params: AulasSearchParams): FiltroAulas {
  const de = data(params[PARAMS.de]);
  const ate = data(params[PARAMS.ate]);

  return {
    busca: primeiro(params[PARAMS.busca]),
    categoria: umDe<CategoriaSlug>(params[PARAMS.categoria], SLUGS),
    instrutor: umDe(params[PARAMS.instrutor], INSTRUTORES),
    // Intervalo invertido é entrada em construção, não filtro: ignorado até
    // o segundo campo fazer sentido.
    de: !de || !ate || de <= ate ? de : undefined,
    ate: !de || !ate || de <= ate ? ate : undefined,
    ordem: umDe<Ordem>(params[PARAMS.ordem], ORDENS) ?? "recentes",
  };
}

/**
 * Quantos filtros estão ativos — alimenta o selo do botão de configurações.
 *
 * A ordenação não entra: ela tem sempre um valor, e um selo permanente não
 * diria nada. O intervalo de datas conta como um só.
 */
export function contarFiltros(filtro: FiltroAulas) {
  return [filtro.categoria, filtro.instrutor, filtro.de || filtro.ate].filter(
    Boolean,
  ).length;
}

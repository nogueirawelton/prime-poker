import { GraphQLClient, gql, type RequestDocument } from "graphql-request";
import { cacheLife, cacheTag } from "next/cache";
import { CMS_CACHE_TAG } from "@/lib/cache-tags";

export { gql };

const PROFILES = {
  minutes: { stale: 60, revalidate: 60, expire: 300 }, // stale 1min  | revalidate 1min  | expire 5min
  hours: { stale: 3600, revalidate: 3600, expire: 86400 }, // stale 1h    | revalidate 1h    | expire 1 dia
  days: { stale: 86400, revalidate: 86400, expire: 604800 }, // stale 1 dia | revalidate 1 dia | expire 7 dias
  weeks: { stale: 604800, revalidate: 604800, expire: 2592000 }, // stale 7dias | revalidate 7dias | expire 30 dias
} as const;

type QueryOptions = {
  variables?: Record<string, unknown>;
  profile?: keyof typeof PROFILES;
  tags?: Array<string>;
};

const client = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_ADMIN_URL}/graphql`,
);

export async function query<T>(
  document: RequestDocument,
  { variables, profile = "hours", tags }: QueryOptions = {},
): Promise<T> {
  "use cache";
  cacheLife(PROFILES[profile]);
  cacheTag(CMS_CACHE_TAG, ...(tags ?? []));
  return client.request<T>(document, variables);
}

/**
 * Como `query()`, para dado dispensável: uma falha vira `null` em vez de erro.
 *
 * O erro precisa ser capturado aqui dentro. Lançado de uma função com
 * `"use cache"`, ele derruba o prerender da página mesmo que quem chamou o
 * capture. A falha fica em cache só por minutos, e não pelo perfil pedido:
 * o WordPress fora do ar por um instante não pode sumir com o dado por horas.
 */
export async function optionalQuery<T>(
  document: RequestDocument,
  { variables, profile = "hours", tags }: QueryOptions = {},
): Promise<T | null> {
  "use cache";
  cacheTag(CMS_CACHE_TAG, ...(tags ?? []));

  try {
    const data = await client.request<T>(document, variables);
    cacheLife(PROFILES[profile]);
    return data;
  } catch (error) {
    console.error("Consulta opcional ao WordPress falhou", error);
    cacheLife(PROFILES.minutes);
    return null;
  }
}

/** Mutations não passam pelo cache: cada chamada vai direto pro WP. */
export async function mutate<T>(
  document: RequestDocument,
  variables?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<T> {
  return client.request<T>({
    document,
    variables,
    requestHeaders: headers,
  });
}

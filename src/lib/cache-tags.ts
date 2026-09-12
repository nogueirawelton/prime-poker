/**
 * Etiquetas de cache do site.
 *
 * Ficam aqui, e não junto de quem as aplica, porque o endpoint de revalidação
 * precisa enxergar todas de uma vez — importar um componente de página dentro
 * de uma Route Handler só para ler uma string é acoplamento à toa.
 */

/** Aplicada a toda entrada de cache do CMS — permite zerar tudo de uma vez. */
export const CMS_CACHE_TAG = "cms";

/** Conteúdo da home vindo do WordPress (ACF `homeFields`). */
export const HOME_CACHE_TAG = "home";

/** Feed do Instagram — provedor externo, fora do CMS. */
export const INSTAGRAM_CACHE_TAG = "instagram";

/**
 * O que `/api/revalidate` limpa quando nenhuma tag é informada.
 *
 * `cms` já cobre tudo que passa por `query()` (home, blog, SEO), mas a home
 * aparece explícita para poder ser limpa sozinha via `?tag=home`.
 */
export const CACHE_TAGS = [
  CMS_CACHE_TAG,
  HOME_CACHE_TAG,
  INSTAGRAM_CACHE_TAG,
] as const;

export type CacheTag = (typeof CACHE_TAGS)[number];

export function isCacheTag(value: string): value is CacheTag {
  return (CACHE_TAGS as ReadonlyArray<string>).includes(value);
}

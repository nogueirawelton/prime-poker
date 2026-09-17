/**
 * Etiquetas de cache do site.
 *
 * Ficam aqui, e não junto de quem as aplica, porque o endpoint de revalidação
 * precisa enxergar todas de uma vez — importar um componente de página dentro
 * de uma Route Handler só para ler uma string é acoplamento à toa.
 *
 * O plugin `prime-poker` (Cache/Revalidation.php) dispara estas mesmas tags ao
 * publicar no WordPress: renomear uma aqui exige renomear lá.
 */

/** Aplicada a toda entrada de cache do CMS — permite zerar tudo de uma vez. */
export const CMS_CACHE_TAG = "cms";

/** Conteúdo da home vindo do WordPress (ACF `homeFields`). */
export const HOME_CACHE_TAG = "home";

/** Feed do Instagram — provedor externo, fora do CMS. */
export const INSTAGRAM_CACHE_TAG = "instagram";

/** Bloco do Yoast buscado pelo `getSEO` (hoje, o da home). */
export const SEO_CACHE_TAG = "seo";

/** Listagens do blog: páginas, busca, destaques, relacionados e sitemap. */
export const POSTS_CACHE_TAG = "posts";

/** Categorias do blog, com a contagem de posts. */
export const CATEGORIES_CACHE_TAG = "categories";

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

/** Tags fixas aceitas pelo endpoint, além das por item abaixo. */
const STATIC_TAGS: ReadonlyArray<string> = [
  ...CACHE_TAGS,
  SEO_CACHE_TAG,
  POSTS_CACHE_TAG,
  CATEGORIES_CACHE_TAG,
];

/**
 * Tags de um item específico: `post:<slug>` e `comments:<id do post>`.
 *
 * O slug pode vir percent-encoded do WordPress (acentos), por isso a classe é
 * "qualquer coisa sem espaço" e não só `[a-z0-9-]`.
 */
const ITEM_TAG = /^(post:\S{1,200}|comments:\d{1,20})$/;

export function isCacheTag(value: string) {
  return STATIC_TAGS.includes(value) || ITEM_TAG.test(value);
}

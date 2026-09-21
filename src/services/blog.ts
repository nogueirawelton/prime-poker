import { query } from "@/graphql/client";
import { COMMENTS } from "@/graphql/queries/blog/COMMENTS";
import { POST } from "@/graphql/queries/blog/POST";
import {
  CATEGORIES,
  POST_SLUGS,
  POSTS,
  POSTS_TOTAL,
} from "@/graphql/queries/blog/POSTS";
import { CATEGORIES_CACHE_TAG, POSTS_CACHE_TAG } from "@/lib/cache-tags";

export type Category = { name: string; slug: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  isSticky: boolean;
  author: string;
  category: Category | null;
  image: { url: string; alt: string } | null;
  readingTime: number;
};

/** Forma crua do nó de post no WPGraphQL. */
type PostNode = {
  id: string;
  databaseId?: number;
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  date: string;
  isSticky?: boolean | null;
  featuredImage?: { node?: { mediaItemUrl: string; altText?: string } } | null;
  author?: { node?: { name?: string; description?: string } } | null;
  categories?: { nodes?: Array<{ name: string; slug: string }> } | null;
  postFields?: {
    faq?: Array<{ question?: string | null; answer?: string | null }> | null;
  } | null;
  seo?: {
    title?: string | null;
    metaDesc?: string | null;
  } | null;
};

export type PostDetail = Post & {
  content: string;
  /**
   * Perguntas frequentes escritas no campo do painel (ACF `faq`).
   *
   * Vazio quando o post não usa o campo — aí vale a convenção antiga, de
   * escrever a FAQ no próprio corpo do texto.
   */
  faq: Array<{ question: string; answer: string }>;
  /** Id numérico do WordPress — é o que a mutation de comentário exige. */
  databaseId: number;
  /** Bio do autor no WordPress; vazia quando ninguém preencheu. */
  authorBio: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Quantos posts por página na listagem. */
export const PAGE_SIZE = 6;

/**
 * Teto para as listagens que precisam varrer o acervo: os slugs do
 * `generateStaticParams` e as categorias.
 *
 * Nenhuma delas traz corpo ou imagem, então o custo é baixo. As listagens
 * exibidas ao usuário não passam por aqui — elas pedem exatamente a página
 * pedida ao servidor.
 */
const MAX_INDEX = 500;

/** Filtros que o servidor aplica; todos opcionais. */
export type PostFilter = {
  /** Termo de busca — casado pelo WordPress em título e conteúdo. */
  search?: string;
  /** Slug da categoria. */
  category?: string;
};

/** Média de leitura em português; serve para uma estimativa, não precisão. */
const WORDS_PER_MINUTE = 200;

/** O WordPress devolve `excerpt` e `content` como HTML. */
function stripHtml(html: string | null | undefined) {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function readingTime(html: string | null | undefined) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function toPost(node: PostNode, html?: string | null): Post {
  const category = node.categories?.nodes?.[0];

  return {
    id: node.id,
    slug: node.slug,
    title: stripHtml(node.title),
    excerpt: stripHtml(node.excerpt),
    date: node.date,
    isSticky: Boolean(node.isSticky),
    author: node.author?.node?.name ?? "Prime Poker Team",
    category: category ? { name: category.name, slug: category.slug } : null,
    image: node.featuredImage?.node
      ? {
          url: node.featuredImage.node.mediaItemUrl,
          alt: node.featuredImage.node.altText || "",
        }
      : null,
    // `html` é usado só aqui e descartado: o corpo não entra no objeto `Post`
    // e portanto não é serializado para os componentes client.
    readingTime: readingTime(html ?? node.excerpt),
  };
}

/** Vira `undefined` para o campo sumir do `where` em vez de virar `null`. */
function optional(value: string | undefined) {
  const clean = value?.trim();
  return clean ? clean : undefined;
}

async function queryPosts(
  variables: Record<string, unknown>,
  tags: Array<string>,
): Promise<Array<Post>> {
  const data = await query<{ posts?: { nodes?: Array<PostNode> } }>(POSTS, {
    variables,
    profile: "hours",
    tags,
  });

  return (data?.posts?.nodes ?? []).map((node) => toPost(node, node.content));
}

/**
 * Uma página da listagem, já filtrada pelo servidor.
 *
 * O `offset` é resolvido no WordPress: a página 7 custa o mesmo que a 1.
 */
export async function getPage(
  page = 1,
  filter: PostFilter = {},
): Promise<Array<Post>> {
  return queryPosts(
    {
      first: PAGE_SIZE,
      offset: Math.max(0, (page - 1) * PAGE_SIZE),
      search: optional(filter.search),
      categoryName: optional(filter.category),
    },
    [POSTS_CACHE_TAG],
  );
}

/** Quantos posts atendem ao filtro. */
export async function getTotal(filter: PostFilter = {}): Promise<number> {
  const data = await query<{ postsTotal?: number }>(POSTS_TOTAL, {
    variables: {
      search: optional(filter.search),
      categoryName: optional(filter.category),
    },
    profile: "hours",
    tags: [POSTS_CACHE_TAG],
  });

  return data?.postsTotal ?? 0;
}

export async function getTotalPages(filter: PostFilter = {}) {
  return Math.max(1, Math.ceil((await getTotal(filter)) / PAGE_SIZE));
}

/** Os posts mais recentes — usado nos destaques da home. */
export async function getLatest(limit = 3): Promise<Array<Post>> {
  return queryPosts({ first: limit }, [POSTS_CACHE_TAG]);
}

/**
 * Destaques: os marcados como sticky no WordPress.
 *
 * Sem nenhum sticky, cai nos mais recentes — a seção nunca fica vazia.
 */
export async function getFeatured(limit = 3): Promise<Array<Post>> {
  const sticky = await queryPosts({ first: limit, isSticky: true }, [
    POSTS_CACHE_TAG,
  ]);

  return sticky.length > 0 ? sticky : getLatest(limit);
}

/**
 * Categorias com pelo menos um artigo.
 *
 * O `postCount` vem do plugin porque o `count` nativo soma todos os post
 * types: sem ele, as categorias dos membros do time apareceriam na navegação
 * do blog levando a páginas vazias.
 */
export async function getCategories(): Promise<Array<Category>> {
  const data = await query<{
    categories?: {
      nodes?: Array<{ name: string; slug: string; postCount?: number }>;
    };
  }>(CATEGORIES, {
    variables: { first: MAX_INDEX },
    profile: "hours",
    tags: [POSTS_CACHE_TAG, CATEGORIES_CACHE_TAG],
  });

  return (data?.categories?.nodes ?? [])
    .filter((node) => (node.postCount ?? 0) > 0)
    .map(({ name, slug }) => ({ name, slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

/**
 * Relacionados: mesma categoria, sem repetir o post atual.
 *
 * Se a categoria não tiver o bastante, completa com os mais recentes —
 * inclusive quando o post não tem categoria alguma.
 */
export async function getRelated(post: Post, limit = 3): Promise<Array<Post>> {
  const sameCategory = post.category
    ? await queryPosts(
        {
          first: limit,
          categoryName: post.category.slug,
          notIn: [post.id],
        },
        [POSTS_CACHE_TAG],
      )
    : [];

  if (sameCategory.length >= limit) return sameCategory;

  const recentes = await queryPosts({ first: limit + 1, notIn: [post.id] }, [
    POSTS_CACHE_TAG,
  ]);

  const seen = new Set(sameCategory.map((item) => item.id));

  return [
    ...sameCategory,
    ...recentes.filter((item) => !seen.has(item.id)),
  ].slice(0, limit);
}

/** Slug e última edição de todos os posts publicados — base do sitemap. */
export async function getPostIndex(): Promise<
  Array<{ slug: string; modified: string }>
> {
  const data = await query<{
    posts?: { nodes?: Array<{ slug: string; modifiedGmt: string }> };
  }>(POST_SLUGS, {
    variables: { first: MAX_INDEX },
    profile: "hours",
    tags: [POSTS_CACHE_TAG],
  });

  // O WordPress devolve a data sem fuso; o sitemap exige um. `modifiedGmt` é
  // UTC, então basta declarar o `Z`.
  return (data?.posts?.nodes ?? []).map((node) => ({
    slug: node.slug,
    modified: `${node.modifiedGmt}Z`,
  }));
}

/** Slugs para o `generateStaticParams` das páginas de post. */
export async function getAllSlugs(): Promise<Array<string>> {
  return (await getPostIndex()).map((node) => node.slug);
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  const data = await query<{ post?: PostNode | null }>(POST, {
    variables: { slug },
    profile: "hours",
    tags: [POSTS_CACHE_TAG, `post:${slug}`],
  });

  const node = data?.post;
  if (!node) return null;

  return {
    ...toPost(node, node.content),
    content: node.content ?? "",
    // Linha sem pergunta é linha em branco que alguém deixou no repetidor:
    // ela viraria um acordeão sem rótulo, impossível de abrir com sentido.
    faq: (node.postFields?.faq ?? [])
      .map((row) => ({
        question: (row?.question ?? "").trim(),
        answer: (row?.answer ?? "").trim(),
      }))
      .filter((row) => "" !== row.question),
    databaseId: node.databaseId ?? 0,
    authorBio: stripHtml(node.author?.node?.description) || null,
    seoTitle: node.seo?.title || null,
    seoDescription: node.seo?.metaDesc || null,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 Comentários                                */
/* -------------------------------------------------------------------------- */

export type Comment = {
  id: string;
  author: string;
  date: string;
  /** HTML do WordPress, já sanitizado por ele na publicação. */
  content: string;
  /** Um nível de respostas; o WordPress permite mais, a tela achata o resto. */
  replies: Array<Comment>;
};

type CommentNode = {
  id: string;
  databaseId: number;
  parentId?: string | null;
  date: string;
  content?: string | null;
  author?: { node?: { name?: string } } | null;
};

/** Etiqueta de cache dos comentários de um post — usada para invalidar. */
export const commentsTag = (postId: number) => `comments:${postId}`;

/**
 * Comentários aprovados, já aninhados.
 *
 * Cache curto e etiqueta própria: comentário novo precisa aparecer rápido, e
 * republicar o post inteiro por causa de um comentário seria desperdício.
 */
export async function getComments(postId: number): Promise<Array<Comment>> {
  if (!postId) return [];

  const data = await query<{ comments?: { nodes?: Array<CommentNode> } }>(
    COMMENTS,
    {
      variables: { contentId: postId },
      profile: "minutes",
      tags: ["comments", commentsTag(postId)],
    },
  );

  const nodes = data?.comments?.nodes ?? [];

  const byId = new Map<string, Comment>();
  for (const node of nodes) {
    byId.set(node.id, {
      id: node.id,
      author: node.author?.node?.name?.trim() || "Anônimo",
      date: node.date,
      content: node.content ?? "",
      replies: [],
    });
  }

  const root: Array<Comment> = [];
  for (const node of nodes) {
    const comment = byId.get(node.id);
    if (!comment) continue;

    // Resposta cujo pai não veio (moderado, apagado) sobe para a raiz em vez
    // de sumir da conversa.
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.replies.push(comment);
    } else {
      root.push(comment);
    }
  }

  return root;
}

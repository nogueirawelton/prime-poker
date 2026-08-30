import { gql } from "graphql-request";

/**
 * Listagem de posts publicados.
 *
 * Todos os filtros são opcionais e resolvidos NO SERVIDOR: busca, categoria,
 * destaque e exclusão. Antes o front baixava o acervo inteiro e filtrava em
 * memória, o que só funciona enquanto o acervo é pequeno.
 *
 * `offset` vem do plugin `prime-poker` — o WPGraphQL sozinho só oferece
 * cursor, que avança mas não salta para uma página numerada.
 *
 * `content` vem junto só para calcular o tempo de leitura. Ele é descartado
 * em `toPost` e nunca entra no objeto `Post`, então não trafega até o cliente.
 */
export const POSTS = gql`
  query Posts(
    $first: Int!
    $offset: Int
    $search: String
    $categoryName: String
    $isSticky: Boolean
    $notIn: [ID]
  ) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
        offset: $offset
        search: $search
        categoryName: $categoryName
        isSticky: $isSticky
        notIn: $notIn
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        content
        date
        isSticky
        featuredImage {
          node {
            mediaItemUrl
            altText
          }
        }
        author {
          node {
            name
          }
        }
        categories(first: 1) {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

/**
 * Total de posts, para saber quantas páginas existem.
 *
 * Campo do plugin `prime-poker`: a conexão do WPGraphQL expõe apenas
 * `hasNextPage`, que responde "existe mais?" mas nunca "quantos ao todo?".
 */
export const POSTS_TOTAL = gql`
  query PostsTotal($search: String, $categoryName: String) {
    postsTotal(search: $search, categoryName: $categoryName)
  }
`;

/**
 * Só os slugs, para o `generateStaticParams`.
 *
 * Query separada de propósito: gerar as rotas não precisa de título, imagem
 * nem corpo, e trazer tudo isso multiplicaria o payload por nada.
 */
export const POST_SLUGS = gql`
  query PostSlugs($first: Int!) {
    posts(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Categorias com posts publicados.
 *
 * `postCount` vem do plugin: o `count` nativo do WordPress soma todos os post
 * types, e aqui a mesma taxonomia é usada pelos membros do time (Coach,
 * Instrutor) — categorias sem nenhum artigo apareceriam na navegação.
 */
export const CATEGORIES = gql`
  query Categories($first: Int!) {
    categories(first: $first, where: { hideEmpty: true }) {
      nodes {
        name
        slug
        postCount
      }
    }
  }
`;

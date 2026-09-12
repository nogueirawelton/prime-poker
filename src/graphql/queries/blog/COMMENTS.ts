import { gql } from "graphql-request";

/**
 * Comentários aprovados de um post.
 *
 * A hierarquia vem plana, com `parentId` em cada nó: o aninhamento é montado
 * no serviço. Pedir `replies` recursivamente no GraphQL custaria uma query por
 * nível e ainda assim pararia numa profundidade arbitrária.
 */
export const COMMENTS = gql`
  query Comments($contentId: ID!, $first: Int = 100) {
    comments(
      first: $first
      where: { contentId: $contentId, order: ASC, orderby: COMMENT_DATE }
    ) {
      nodes {
        id
        databaseId
        parentId
        date
        content
        author {
          node {
            name
          }
        }
      }
    }
  }
`;

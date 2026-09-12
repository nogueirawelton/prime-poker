import { gql } from "graphql-request";

/**
 * Publica um comentário.
 *
 * `success` vem `true` mesmo quando o WordPress segura o comentário para
 * moderação — nesse caso `comment` volta nulo, e é assim que a tela sabe que
 * deve avisar que o texto ainda vai passar por aprovação.
 */
export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $commentOn: Int!
    $content: String!
    $author: String!
    $authorEmail: String!
    $parent: ID
  ) {
    createComment(
      input: {
        commentOn: $commentOn
        content: $content
        author: $author
        authorEmail: $authorEmail
        parent: $parent
      }
    ) {
      success
      comment {
        id
      }
    }
  }
`;

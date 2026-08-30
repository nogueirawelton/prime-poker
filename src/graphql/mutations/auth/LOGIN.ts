import { gql } from "@/graphql/client";

/**
 * Autenticação via wp-graphql-jwt-authentication.
 *
 * `username` aceita o e-mail: é assim que criamos as contas no cadastro.
 * O `refreshToken` só é emitido aqui — o `refreshJwtAuthToken` devolve
 * apenas um `authToken` novo e não rotaciona o refresh.
 */
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        databaseId
        playerTier
      }
    }
  }
`;

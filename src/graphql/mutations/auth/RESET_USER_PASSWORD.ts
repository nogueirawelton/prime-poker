import { gql } from "@/graphql/client";

/**
 * Grava a nova senha a partir da chave do e-mail.
 *
 * A chave é de uso único: o WordPress a descarta ao redefinir. O plugin
 * `prime-poker` também troca o segredo JWT do usuário, derrubando as sessões
 * abertas em outros dispositivos.
 */
export const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword(
    $key: String!
    $login: String!
    $password: String!
  ) {
    resetUserPassword(
      input: { key: $key, login: $login, password: $password }
    ) {
      user {
        databaseId
      }
    }
  }
`;

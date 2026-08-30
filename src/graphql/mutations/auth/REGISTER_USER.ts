import { gql } from "@/graphql/client";

/**
 * Cadastro de usuário no WordPress.
 *
 * `playerTier` vem do plugin `prime-poker` e confirma que o tier
 * inicial foi aplicado. Ele resolve mesmo num cadastro anônimo porque o
 * WPGraphQL chama `wp_set_current_user()` com o usuário recém-criado antes de
 * montar a resposta — sem isso o campo voltaria nulo, já que o plugin só
 * revela o tier ao próprio dono.
 *
 * Só `username` é obrigatório no `RegisterUserInput`, mas sem `password` o WP
 * cria a conta sem senha e manda o usuário definir uma por e-mail — fluxo que
 * não queremos aqui. `displayName` evita que o painel mostre o e-mail cru.
 */
export const REGISTER_USER = gql`
  mutation RegisterUser(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $displayName: String!
  ) {
    registerUser(
      input: {
        username: $username
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        displayName: $displayName
      }
    ) {
      user {
        databaseId
        playerTier
      }
    }
  }
`;

import { gql } from "graphql-request";

/**
 * Atualiza o perfil do jogador logado.
 *
 * Quem decide de quem é o perfil é o WordPress, pelo token: a mutation não
 * aceita ID de usuário, então ninguém edita a conta de outro.
 */
export const UPDATE_PLAYER_PROFILE = gql`
  mutation UpdatePlayerProfile(
    $name: String
    $email: String
    $phone: String
    $city: String
    $bio: String
  ) {
    updatePlayerProfile(
      input: {
        name: $name
        email: $email
        phone: $phone
        city: $city
        bio: $bio
      }
    ) {
      name
      email
      phone
      city
      bio
    }
  }
`;

/** Troca a senha, conferindo a atual. */
export const UPDATE_PLAYER_PASSWORD = gql`
  mutation UpdatePlayerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    updatePlayerPassword(
      input: { currentPassword: $currentPassword, newPassword: $newPassword }
    ) {
      success
    }
  }
`;

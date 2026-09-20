import { gql } from "graphql-request";

/**
 * O jogador logado.
 *
 * `playerTier*` vêm do plugin `prime-poker` e só resolvem para o próprio
 * usuário — por isso esta query só funciona pelo `authQuery`.
 */
export const VIEWER = gql`
  query Viewer {
    viewer {
      databaseId
      name
      username
      email
      registeredDate
      playerTier
      playerTierLabel
      playerTierExpiresAt
      studyStreak
    }
  }
`;

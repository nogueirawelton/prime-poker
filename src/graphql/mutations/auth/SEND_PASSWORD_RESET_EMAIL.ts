import { gql } from "@/graphql/client";

/**
 * Pede o e-mail de redefinição de senha.
 *
 * O WPGraphQL responde `success: true` mesmo quando o e-mail não existe na
 * base — de propósito, para não revelar quais contas existem. O link do
 * e-mail aponta para o front: quem monta a mensagem é o plugin `prime-poker`.
 */
export const SEND_PASSWORD_RESET_EMAIL = gql`
  mutation SendPasswordResetEmail($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      success
    }
  }
`;

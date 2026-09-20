import { gql } from "graphql-request";

/** Curte ou descurte uma dúvida ou resposta. */
export const TOGGLE_QUESTION_LIKE = gql`
  mutation ToggleQuestionLike($commentId: Int!) {
    toggleQuestionLike(input: { commentId: $commentId }) {
      liked
      likeCount
    }
  }
`;

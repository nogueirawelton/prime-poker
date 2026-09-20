import { gql } from "graphql-request";

/** Marca ou desmarca a aula como concluída, a pedido do jogador. */
export const TOGGLE_LESSON_COMPLETED = gql`
  mutation ToggleLessonCompleted($lessonId: Int!) {
    toggleLessonCompleted(input: { lessonId: $lessonId }) {
      completed
    }
  }
`;

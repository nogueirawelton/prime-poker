import { gql } from "graphql-request";

/** Salva a aula na lista do jogador, ou a tira de lá. */
export const TOGGLE_LESSON_SAVED = gql`
  mutation ToggleLessonSaved($lessonId: Int!) {
    toggleLessonSaved(input: { lessonId: $lessonId }) {
      saved
    }
  }
`;

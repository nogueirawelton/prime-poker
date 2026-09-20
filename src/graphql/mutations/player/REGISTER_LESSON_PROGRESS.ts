import { gql } from "graphql-request";

/**
 * Guarda onde o jogador parou.
 *
 * O player envia de tempos em tempos e ao sair; passando de 90% da aula, o
 * plugin já a marca como concluída e devolve isso aqui.
 */
export const REGISTER_LESSON_PROGRESS = gql`
  mutation RegisterLessonProgress($lessonId: Int!, $seconds: Int!) {
    registerLessonProgress(
      input: { lessonId: $lessonId, seconds: $seconds }
    ) {
      watchedSeconds
      completed
    }
  }
`;

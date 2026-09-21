import { gql } from "graphql-request";

/** Conta a visualização do jogador logado; o plugin ignora repetição em 12h. */
export const REGISTER_LESSON_VIEW = gql`
  mutation RegisterLessonView($lessonId: Int!) {
    registerLessonView(input: { lessonId: $lessonId }) {
      viewCount
    }
  }
`;

import { gql } from "graphql-request";

/**
 * Registra a dúvida do jogador na aula (um comentário do WordPress).
 *
 * Com `parentId`, a mensagem entra como resposta dentro daquela conversa.
 */
export const ASK_LESSON_QUESTION = gql`
  mutation AskLessonQuestion($lessonId: Int!, $text: String!, $parentId: Int) {
    askLessonQuestion(
      input: { lessonId: $lessonId, text: $text, parentId: $parentId }
    ) {
      commentId
    }
  }
`;

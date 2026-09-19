import { gql } from "graphql-request";

/**
 * Aulas da área do jogador.
 *
 * As aulas só aparecem para jogador logado (plugin `prime-poker`, módulo
 * `Lessons`) — estas queries vão pelo `authQuery`. As exceções públicas são
 * `LESSON_TRACKS`, `LESSON_INSTRUCTORS` e `LESSON_SUGGESTION`, cacheadas.
 */

/** O que o card da aula precisa. */
const LESSON_CARD = gql`
  fragment LessonCard on Aula {
    databaseId
    slug
    title
    date
    canWatch
    minimumTier
    minimumTierLabel
    duration
    viewCount
    featuredImage {
      node {
        sourceUrl
      }
    }
    lessonFields {
      level
      instructor {
        nodes {
          ... on Instrutor {
            title
          }
        }
      }
    }
    trilhas(first: 1) {
      nodes {
        slug
        name
        trackFields {
          badge
          color
        }
      }
    }
  }
`;

/** Uma página da listagem e o total do mesmo filtro. */
export const LESSONS = gql`
  ${LESSON_CARD}
  query Lessons(
    $first: Int!
    $where: RootQueryToAulaConnectionWhereArgs
    $search: String
    $track: String
    $instructor: Int
    $from: String
    $to: String
  ) {
    aulas(first: $first, where: $where) {
      nodes {
        ...LessonCard
      }
    }
    lessonsTotal(
      search: $search
      track: $track
      instructor: $instructor
      from: $from
      to: $to
    )
  }
`;

/** A aula aberta: o card mais descrição, vídeo e materiais. */
export const LESSON = gql`
  ${LESSON_CARD}
  query Lesson($slug: ID!) {
    aula(id: $slug, idType: SLUG) {
      ...LessonCard
      content
      video {
        provider
        url
      }
      materials {
        name
        url
        fileSize
      }
    }
  }
`;

/** Trilhas com aula publicada. Pública: vai pelo `query()` cacheado. */
export const LESSON_TRACKS = gql`
  query LessonTracks {
    trilhas(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
        name
        trackFields {
          badge
          color
          order
        }
      }
    }
  }
`;

/** Instrutores do filtro. Pública. */
export const LESSON_INSTRUCTORS = gql`
  query LessonInstructors {
    instrutores(first: 100, where: { orderby: { field: TITLE, order: ASC } }) {
      nodes {
        databaseId
        title
      }
    }
  }
`;

/** Aula mais próxima do assunto de um post. Pública e só com dados de card. */
export const LESSON_SUGGESTION = gql`
  query LessonSuggestion($subject: String!, $track: String) {
    lessonSuggestion(subject: $subject, track: $track) {
      slug
      title
      instructor
      duration
    }
  }
`;

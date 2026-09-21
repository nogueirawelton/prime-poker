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
    watchedSeconds
    saved
    completed
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
            featuredImage {
              node {
                sourceUrl(size: THUMBNAIL)
              }
            }
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
    $tier: String
    $level: String
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
      tier: $tier
      level: $level
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
      comments(first: 100, where: { order: ASC, orderby: COMMENT_DATE }) {
        nodes {
          databaseId
          parentDatabaseId
          date
          text
          authorLabel
          authorAvatar
          isInstructor
          isMine
          likeCount
          liked
        }
      }
    }
  }
`;

/**
 * A aula em andamento mais recente do jogador — o card fixo da sidebar.
 *
 * Quem decide qual é fica no plugin: é ele que tem o instante do último
 * avanço de cada aula.
 */
export const CONTINUE_WATCHING = gql`
  ${LESSON_CARD}
  query ContinueWatching {
    continueWatching {
      ...LessonCard
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
          icon
        }
      }
    }
  }
`;

/** Tiers do site, para o filtro por nível de acesso. Pública. */
export const PLAYER_TIERS = gql`
  query PlayerTiers {
    playerTiers {
      slug
      label
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

/**
 * A aula que um post do blog divulga.
 *
 * Só a **Aula relacionada** escolhida no painel do post: o plugin deixou de
 * palpitar por palavras do título na 1.19.0, porque o palpite errava em
 * público. Post sem escolha não tem chamada.
 */
export const RELATED_LESSON = gql`
  query RelatedLesson($postId: Int!) {
    relatedLesson(postId: $postId) {
      slug
      title
      instructor
      duration
    }
  }
`;

import { gql } from "graphql-request";

/** Post único pelo slug, já com o corpo em HTML. */
export const POST = gql`
  query Post($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      title
      excerpt
      content
      date
      modified
      featuredImage {
        node {
          mediaItemUrl
          altText
        }
      }
      author {
        node {
          name
        }
      }
      categories(first: 1) {
        nodes {
          name
          slug
        }
      }
      seo {
        title
        metaDesc
        opengraphImage {
          mediaItemUrl
        }
      }
    }
  }
`;

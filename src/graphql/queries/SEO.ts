import { gql } from "graphql-request";

/**
 * Consulta o bloco de SEO de um único nó.
 * Mesma convenção do HOME: `page(id: "home", idType: URI)`.
 */
export const SEO = (type: string, idType: string, id: string) => {
  return gql`
    query {
      ${type}(id: "${id}", idType: ${idType}) {
        seo {
          canonical

          opengraphImage {
            mediaItemUrl
          }

          metaDesc
          focuskw
          title
        }
      }
    }
  `;
};

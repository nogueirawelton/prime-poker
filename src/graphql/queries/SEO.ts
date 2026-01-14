import { gql } from "graphql-request";

export const SEO = (type: string, param: string, slug: string) => {
  return gql`
    query {
      ${type}(where: {${param}: "${slug}"}) {
        nodes {
          ${type === "products" ? "... on SimpleProduct {" : ""}
          seo {
            canonical

            opengraphImage {
              mediaItemUrl
            }
            
            metaDesc
            focuskw
            title
          }
          ${type === "products" ? "}" : ""}
        }
      }
    }
`;
};

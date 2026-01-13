import { gql } from "graphql-request";

export const HOME = gql`
  query Home {
    page(id: "home", idType: URI) {
      homeFields {
        faq {
          title
          questions {
            answer
            title
          }
        }

        bePart {
          title
          description
          steps {
            step
          }
        }

        evolution {
          title
          description
          accumulatedEarnings {
            title
            amount
          }

          successStories(first: 100) {
            nodes {
              ... on Depoimento {
                title
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                testimonialFields {
                  testimonial
                  earnings
                }
              }
            }
          }
        }

        instructors {
          title
          description
          instructors(first: 100) {
            nodes {
              ... on Instrutor {
                id
                title
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                tags {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        }

        headCoaches {
          title
          description
          coachs(first: 100) {
            nodes {
              ... on Instrutor {
                id
                title
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                tags {
                  nodes {
                    name
                  }
                }
                instructorFields {
                  earnings
                  description
                }
              }
            }
          }
        }

        whatWeDo {
          title
          description
          structure {
            title
            items {
              item
            }
          }
          feature {
            title
            icon
            description
          }
        }

        whoWeAre {
          description
          earnings
          mission
          players
          title
          values
          vision
          years
        }
      }
    }
  }
`;

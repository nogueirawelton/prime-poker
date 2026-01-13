import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_ADMIN_URL}/graphql`,
  {
    next: {
      revalidate: 60 * 60 * 24 * 7,
    },
  },
);

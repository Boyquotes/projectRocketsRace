import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Adjust this to your GraphQL server URL
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
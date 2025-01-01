import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import {GraphQLWsLink} from "@apollo/client/link/subscriptions"
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // HTTP endpoint for queries and mutations
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql', // WebSocket endpoint for subscriptions
}));

// Split link based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
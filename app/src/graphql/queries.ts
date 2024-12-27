import { gql } from '@apollo/client';

export const GET_ROCKETS = gql`
  query {
    rockets {
      id
      name
      description
      image
    }
  }
`;

export const START_RACE_MUTATION = gql`
  mutation StartRace($rocket1: String!, $rocket2: String!) {
    startRace(rocket1: $rocket1, rocket2: $rocket2) {
      id
      rocket1 {
        id
        progress
        exploded
      }
      rocket2 {
        id
        progress
        exploded
      }
      winner
    }
  }
`;
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
export const GET_RACES = gql`
  query {
    races {
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

export const START_RACE_MUTATION = gql`
  mutation StartRace($rocket1: ID!, $rocket2: ID!) {
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

export const ROCKET_PROGRESS_SUBSCRIPTION = gql`
  subscription OnRocketProgress($raceId: ID!, $rocketId: ID!) {
    rocketProgress(raceId: $raceId, rocketId: $rocketId) {
      raceId
      rocketId
      progress
      exploded
    }
  }
`;
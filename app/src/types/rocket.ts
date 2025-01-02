export interface RocketInfo {
    id: string;
    name: string;
    description: string;
    image: string;
  }
  
  interface RocketProgressInfo {
    id: string;
    progress: number;
    exploded: boolean;
  }
  
  interface RaceProgressDebug {
    raceId: string;
    rocket1: RocketProgressInfo;
    rocket2: RocketProgressInfo;
  }

  export interface RaceData {
    startRace: {
      id: string;
      rocket1: {
        id: number;
        progress: number;
        exploded: boolean;
      };
      rocket2: {
        id: number;
        progress: number;
        exploded: boolean;
      };
      winner: string | null;
    };
  }

  export interface RocketLaunchProps {
    rocketInfo: RocketInfo;
    raceProgressDebug: RaceProgressDebug;
  } 
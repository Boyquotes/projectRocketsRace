'use client';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_ROCKETS, START_RACE_MUTATION, ROCKET_PROGRESS_SUBSCRIPTION } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { RaceData } from '@/types/rocket'
import RocketLaunch from '@/components/RocketLaunch';
import useStore from '@/store/useStore';

export default function Home() {

  const router = useRouter();
  const { command, setCommand } = useStore(); // Access Zustand store
  const { loading, error, data } = useQuery(GET_ROCKETS);
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [raceLaunchedBy, setRaceLaunchedBy] = useState<string | null>(null);
  const [raceProgressDebug, setRaceProgressDebug] = useState<any>(null);

  const [startRace, { data: originalRaceData, loading: raceLoading, error: raceError }] = useMutation<RaceData>(START_RACE_MUTATION);
  const [raceData, setRaceData] = useState(originalRaceData)

  // Create a more robust method to get subscription variables for rocket 1
  const getSubscriptionVariables = useCallback(() => {
    // Ensure both raceId and rocketId are non-null and non-empty
    if (
      raceData?.startRace?.id && 
      raceData.startRace.rocket1?.id
    ) {
      return { 
        raceId: String(raceData.startRace.id),
        rocketId: String(raceData.startRace.rocket1.id)
      };
    }
    return null;
  }, [raceData?.startRace]);

  // Create a more robust method to get subscription variables for rocket 2
  const getSubscriptionRocket2 = useCallback(() => {
    // Ensure both raceId and rocketId are non-null and non-empty
    if (
      raceData?.startRace?.id && 
      raceData.startRace.rocket2?.id
    ) {
      return { 
        raceId: String(raceData.startRace.id),
        rocketId: String(raceData.startRace.rocket2.id)
      };
    }
    return null;
  }, [raceData?.startRace]);

  // Track whether subscription should be active
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);

  // Update subscription readiness when race data is available
  useEffect(() => {
    if (raceData?.startRace?.id && raceData.startRace.rocket1?.id && raceData.startRace.rocket2?.id) {
      setIsSubscriptionReady(true);
    }
  }, [raceData]);

  // Subscription for rocket1 progress
  const { data: progressData, error: progressError } = useSubscription(
    ROCKET_PROGRESS_SUBSCRIPTION, 
    { 
      variables: getSubscriptionVariables() || {},
      skip: !isSubscriptionReady, // More explicit skip condition
      onComplete: () => {
        console.log('Rocket Progress Subscription Completed');
      },
      onData: ({ }) => {
        console.log('Subscription Data Received in OnData:');
      }
    }
  );

  // Subscription for rocket2 progress
  const { data: progressData2, error: progressError2 } = useSubscription(
    ROCKET_PROGRESS_SUBSCRIPTION, 
    { 
      variables: getSubscriptionRocket2() || {},
      skip: !isSubscriptionReady, // More explicit skip condition
      onComplete: () => {
        console.log('Rocket Progress Subscription Completed');
      },
      onData: ({ }) => {
        console.log('Subscription Data Received in OnData:');
      }
    }
  );

  // Update info when progress data changes
  useEffect(() => {
    if (progressData?.rocketProgress && progressData2?.rocketProgress) {
      // Restructure the progress data to match previous format
      setRaceProgressDebug("");
      const rocketProgressDebugData = {
        raceId: progressData.rocketProgress.raceId,
        rocket1: {
          id: progressData.rocketProgress.rocketId,
          progress: progressData.rocketProgress.progress,
          exploded: progressData.rocketProgress.exploded
        },
        rocket2: {
          id: progressData2.rocketProgress.rocketId,
          progress: progressData2.rocketProgress.progress,
          exploded: progressData2.rocketProgress.exploded
        }
      };
      setRaceProgressDebug(rocketProgressDebugData);
    }
  }, [progressData, progressData2]);

  // Comprehensive error handling
  useEffect(() => {
    if (progressError) {
      console.error('Rocket Progress Subscription Error:', progressError);
      // Optionally reset subscription readiness
      setIsSubscriptionReady(false);
    }
  }, [progressError]);

  useEffect(() => {
    // Create socket connection to share selected rockets between tabs and differents browsers
    const newSocket = io('http://localhost:3001', { 
      transports: ['websocket'],
      reconnection: true 
    });
    setSocket(newSocket);

    // Listen for synchronized rocket selections
    newSocket.on('rocket-selection', (selectedRocketIds: string[]) => {
      setSelectedRockets(selectedRocketIds);
      localStorage.setItem('selectedRockets', JSON.stringify(selectedRocketIds));
    });

    // Listen for race launched event
    newSocket.on('race-launched', (data: { rocketIds: string[], initiatorSocketId: string }) => {
      setRaceLaunchedBy(data.initiatorSocketId);
      setCommand('start');
    });

    // Cleanup socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleRocketSelect = (rocketId: string) => {
    let newSelectedRockets = [...selectedRockets];
    // If rocket is already selected, remove it
    if (newSelectedRockets.includes(rocketId)) {
      newSelectedRockets = newSelectedRockets.filter(id => id !== rocketId);
    } else {
      // If less than 2 rockets are selected, add the new rocket
      if (newSelectedRockets.length < 2) {
        newSelectedRockets.push(rocketId);
      } else {
        // If 2 rockets are already selected, replace the first one
        newSelectedRockets.shift();
        newSelectedRockets.push(rocketId);
      }
    }
    // Update state, local storage, and broadcast to other tabs
    setSelectedRockets(newSelectedRockets);
    localStorage.setItem('selectedRockets', JSON.stringify(newSelectedRockets));
    socket?.emit('rocket-selection', newSelectedRockets);
  };

  const handleLaunchRace = async() => {
    if (selectedRockets.length === 2) {
      setRaceProgressDebug("");
      console.log('Race launched');
      // Start race mutation
      let result = await startRace({
        variables: {
          rocket1: selectedRockets[0],
          rocket2: selectedRockets[1]
        },
        onError: (error) => {
          console.error('Race Start Error:', error);
          // Optionally show error to user
        }
      });
      if(result){
        console.log("result", result)
        setRaceData(result.data);
        // Emit race-launched event to all connected clients
        socket?.emit('race-launched', selectedRockets);
      }

    }
  };
  // Filter only the selected rockets
  const selectedRocketsTab = data?.rockets?.filter((rocket: any) => 
    selectedRockets.includes(rocket.id)
  ) || [];

  if (loading) return <p>Loading rockets...</p>;
  if (error) return <p>Error loading rockets: {error.message}</p>;

  return (
    <div className="container mx-auto p-4 font-[family-name:var(--font-geist-sans)]">
      <main>
        { command === 'retry' && <div className="text-2xl text-center font-bold mb-4">Take your revenge, another race?</div> }
        {/* Display Rockets selection and bouton launch */}
        {!raceLaunchedBy || command == 'retry' ? (
            <div>
              <h1 className="text-2xl text-center font-bold mb-4">Select the 2 Rockets for the Race</h1>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {data.rockets.map((rocket: any) => (
                  <div 
                    key={rocket.id} 
                    onClick={() => handleRocketSelect(rocket.id)}
                    className={`border p-2 rounded-lg shadow-md flex flex-col items-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-blue-500 cursor-pointer transform active:scale-95 hover:bg-blue-50 active:bg-blue-100hover:text-black ${selectedRockets.includes(rocket.id) ? 'ring-2 ring-blue-500 bg-blue-100 text-black' : ''}`}
                  >
                    {rocket.image && (
                      <div className="mb-2 w-full h-40 relative overflow-hidden rounded-lg">
                        <Image 
                          src={rocket.image} 
                          alt={rocket.name} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h2 className="text-sm font-semibold mb-1">{rocket.name}</h2>
                    <p className="text-xs text-center line-clamp-2">{rocket.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-6 relative">
                <div 
                  className="group"
                  data-tooltip="Choose two rockets before take off"
                >
                  <button 
                    onClick={handleLaunchRace}
                    disabled={selectedRockets.length !== 2}
                    className={`flex items-center font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 focus:outline-none focus:ring-2 ocus:ring-opacity-50 ${selectedRockets.length === 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95 hover:shadow-xl focus:ring-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'}`}
                  >
                    <span className="flex items-center">
                      🚀 Launch the Race 🏁
                    </span>
                  </button>
                  {selectedRockets.length !== 2 && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    >
                      Choose two rockets before take off
                    </div>
                  )}
                </div>
              </div>
            </div>
        ): raceLaunchedBy && command == "start" && (
            <div>
              {/* Display when Race is Launched */}
              {raceData?.startRace && raceProgressDebug && (
                <div className="flex mx-auto p-4">
                  {selectedRocketsTab.map((rocket: any) => (
                    <RocketLaunch key={rocket.id} rocketInfo={rocket} raceProgressDebug={raceProgressDebug} />
                  ))}
                </div>
              )}
            </div>
        )}
      </main>
    </div>
  );
}

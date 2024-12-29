'use client';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_ROCKETS, START_RACE_MUTATION, ROCKET_PROGRESS_SUBSCRIPTION } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

export default function RocketsPage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_ROCKETS);
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [raceLaunchedBy, setRaceLaunchedBy] = useState<string | null>(null);
  const [raceProgressDebug, setRaceProgressDebug] = useState<any>(null);

  interface RaceData {
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

  const [startRace, { data: raceData, loading: raceLoading, error: raceError }] = useMutation<RaceData>(START_RACE_MUTATION);

  // Create a more robust method to get subscription variables
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

  // Track whether subscription should be active
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);

  // Update subscription readiness when race data is available
  useEffect(() => {
    if (raceData?.startRace?.id && raceData.startRace.rocket1?.id) {
      setIsSubscriptionReady(true);
    }
  }, [raceData]);

  // Subscription for rocket progress
  const { data: progressData, error: progressError } = useSubscription(
    ROCKET_PROGRESS_SUBSCRIPTION, 
    { 
      variables: getSubscriptionVariables() || {},
      skip: !isSubscriptionReady, // More explicit skip condition
      onSubscriptionComplete: () => {
        console.log('Rocket Progress Subscription Completed');
      },
      onSubscriptionData: ({ subscriptionData }) => {
        console.log('Subscription Data Received:', subscriptionData);
      }
    }
  );

  // Update debug info when progress data changes
  useEffect(() => {
    if (progressData?.rocketProgress) {
      console.log('Rocket Progress Update:', progressData.rocketProgress);
      
      // Restructure the progress data to match previous format
      const rocketProgressDebugData = {
        raceId: progressData.rocketProgress.raceId,
        rocket1: {
          id: progressData.rocketProgress.rocketId,
          progress: progressData.rocketProgress.progress,
          exploded: progressData.rocketProgress.exploded
        },
        rocket2: {
          id: progressData.rocketProgress.rocketId,
          progress: progressData.rocketProgress.progress,
          exploded: progressData.rocketProgress.exploded
        }
      };

      setRaceProgressDebug(rocketProgressDebugData);
    }
  }, [progressData]);

  // Comprehensive error handling
  useEffect(() => {
    if (progressError) {
      console.error('Rocket Progress Subscription Error:', progressError);
      // Optionally reset subscription readiness
      setIsSubscriptionReady(false);
    }
  }, [progressError]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3001', { 
      transports: ['websocket'],
      reconnection: true 
    });
    setSocket(newSocket);

    // Listen for synchronized rocket selections
    newSocket.on('rocket-selection', (selectedRocketIds: string[]) => {
      setSelectedRockets(selectedRocketIds);
      console.log('Race selectedRocketIds received:', selectedRocketIds);
      localStorage.setItem('selectedRockets', JSON.stringify(selectedRocketIds));
    });

    // Listen for race launched event
    newSocket.on('race-launched', (data: { rocketIds: string[], initiatorSocketId: string }) => {
      console.log('Race launched received:', data);
      setRaceLaunchedBy(data.initiatorSocketId);
      
      // Optional: Add additional logic here if needed
      // For example, you might want to update some state or trigger an action
    });

    // Load previously selected rockets from local storage
    const storedRockets = localStorage.getItem('selectedRockets');
    if (storedRockets) {
      const parsedRockets = JSON.parse(storedRockets);
      setSelectedRockets(parsedRockets);
      newSocket.emit('sync-rocket-selection', parsedRockets);
    }

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

  const handleLaunchRace = () => {
    console.log('selectedRockets', selectedRockets)
    if (selectedRockets.length === 2) {
      console.log('Race launched');
      console.log(selectedRockets[0], selectedRockets[1])
      // Start race mutation
      startRace({
        variables: {
          rocket1: selectedRockets[0],
          rocket2: selectedRockets[1]
        },
        onError: (error) => {
          console.error('Race Start Error:', error);
          // Optionally show error to user
        }
      });
      // Emit race-launched event to all connected clients
      socket?.emit('race-launched', selectedRockets);
      
      // Optional: Add a race invitation event if needed
      socket?.emit('race-invitation', selectedRockets);
      
      // Navigate to race page
      // router.push('/race');
    }
  };

  if (loading) return <p>Loading rockets...</p>;
  if (error) return <p>Error loading rockets: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rockets</h1>
      <div className="grid grid-cols-5 gap-3">
        {data.rockets.map((rocket: any) => (
          <div 
            key={rocket.id} 
            onClick={() => handleRocketSelect(rocket.id)}
            className={`border p-2 rounded-lg shadow-md flex flex-col items-center 
                       transition-all duration-300 ease-in-out 
                       hover:scale-105 hover:shadow-xl 
                       hover:border-blue-500 
                       cursor-pointer 
                       transform active:scale-95
                       hover:bg-blue-50 
                       active:bg-blue-100
                       hover:text-black
                       ${selectedRockets.includes(rocket.id) ? 'ring-2 ring-blue-500 bg-blue-100 text-black' : ''}`}
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
            {selectedRockets.includes(rocket.id) && (
              <div className="mt-1 text-xs text-blue-600">
                Selected (Player: {selectedRockets.indexOf(rocket.id) + 1})
              </div>
            )}
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
            className={`
              flex items-center
              font-bold 
              py-3 px-6 
              rounded-full 
              shadow-lg 
              transform 
              transition-all 
              duration-300 
              focus:outline-none 
              focus:ring-2 
              focus:ring-opacity-50
              ${selectedRockets.length === 2 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95 hover:shadow-xl focus:ring-blue-500' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'}
            `}
          >
            <span className="flex items-center">
              🚀 Launch the Race 🏁
            </span>
          </button>
          {selectedRockets.length !== 2 && (
            <div 
              className="
                absolute 
                top-full 
                left-1/2 
                transform 
                -translate-x-1/2 
                mt-2 
                bg-black 
                text-white 
                text-xs 
                px-3 
                py-2 
                rounded-lg 
                opacity-0 
                group-hover:opacity-100 
                transition-opacity 
                duration-300 
                z-10
              "
            >
              Choose two rockets before take off
            </div>
          )}

          {/* Race Launched Debug Text */}
          {raceLaunchedBy && (
            <div className="text-center mt-4 p-2 bg-yellow-100 text-yellow-800 rounded-lg">
              🏁 Race Launched! 
              <br />
              Initiated by Socket ID: {raceLaunchedBy.slice(0, 8)}...
            </div>
          )}

          <div 
            className="
              absolute 
              top-full 
              left-1/2 
              transform 
              -translate-x-1/2 
              mt-2 
              bg-black 
              text-white 
              text-xs 
              px-3 
              py-2 
              rounded-lg 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity 
              duration-300 
              z-10
            "
          >
            Race launched by {raceLaunchedBy}
          </div>

          {/* Debug Section for Race Launch */}
          {raceData?.startRace && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-yellow-800">
              <h3 className="font-bold mb-2">Race Launch Debug</h3>
              <div>
                <p>Race ID: {raceData.startRace.id}</p>
                <p>Rocket 1 ID: {raceData.startRace.rocket1.id}</p>
                <p>Rocket 2 ID: {raceData.startRace.rocket2.id}</p>
              </div>
            </div>
          )}

          {/* Debug Section for Rocket Progress */}
          {raceProgressDebug && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold mb-2">Rocket Progress Debug</h3>
              <div>
                <p>Race ID: {raceProgressDebug.raceId}</p>
                <div>
                  <h4>Rocket 1</h4>
                  <p>Progress: {raceProgressDebug.rocket1.progress.toFixed(2)}%</p>
                  <p>Exploded: {raceProgressDebug.rocket1.exploded ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h4>Rocket 2</h4>
                  <p>Progress: {raceProgressDebug.rocket2.progress.toFixed(2)}%</p>
                  <p>Exploded: {raceProgressDebug.rocket2.exploded ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
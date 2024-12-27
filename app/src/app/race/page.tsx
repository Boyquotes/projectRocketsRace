'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_ROCKETS, START_RACE_MUTATION } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';

// Dynamically import the game to prevent SSR issues
const RocketRaceGame = dynamic(() => import('@/components/RocketRaceGame'), {
    ssr: false
  });

export default function RacePage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_ROCKETS);
  interface RaceData {
    startRace: {
      id: string;
      rocket1: {
        id: string;
        progress: number;
        exploded: boolean;
      };
      rocket2: {
        id: string;
        progress: number;
        exploded: boolean;
      };
      winner: string | null;
    };
  }

  const [startRace, { data: raceData, loading: raceLoading, error: raceError }] = useMutation<RaceData>(START_RACE_MUTATION);

  // Get selected rocket IDs from local storage or search params
  const [selectedRocketIds, setSelectedRocketIds] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [raceStatus, setRaceStatus] = useState<'start' | 'join'>('start');

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3001', { 
      transports: ['websocket'],
      reconnection: true 
    });
    setSocket(newSocket);

    // Listen for race invitation
    newSocket.on('race-invitation', () => {
      setRaceStatus('join');
    });

    // Cleanup socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log('Race Page Mounted');
    const storedRockets = localStorage.getItem('selectedRockets');
    console.log('Stored Rockets:', storedRockets);
    
    if (storedRockets) {
      try {
        const parsedRockets = JSON.parse(storedRockets);
        console.log('Parsed Rockets:', parsedRockets);
        
        if (parsedRockets.length !== 2) {
          console.log('Not exactly 2 rockets, redirecting');
          router.push('/rockets');
        } else {
          setSelectedRocketIds(parsedRockets);
        }
      } catch (error) {
        console.error('Error parsing stored rockets:', error);
        router.push('/rockets');
      }
    } else {
      console.log('No stored rockets, redirecting');
      router.push('/rockets');
    }
  }, [router]);

  const handleStartRace = () => {
    // Send race invitation to other tabs
    socket?.emit('race-invitation', selectedRocketIds);

    // Start race mutation
    startRace({
      variables: {
        rocket1: selectedRocketIds[0],
        rocket2: selectedRocketIds[1]
      },
      onError: (error) => {
        console.error('Race Start Error:', error);
        // Optionally show error to user
      }
    });
  };

  const handleJoinRace = () => {
    // Implement join race logic
    console.log('Joining race');
  };

  if (loading) return <p>Loading rockets...</p>;
  if (error) return <p>Error loading rockets: {error.message}</p>;

  // Filter only the selected rockets
  const selectedRockets = data?.rockets?.filter((rocket: any) => 
    selectedRocketIds.includes(rocket.id)
  ) || [];

  if (selectedRockets.length !== 2) {
    return null; // This will trigger the redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Rocket Race</h1>
      <div className="grid grid-cols-2 gap-3">
        {selectedRockets.map((rocket: any) => (
          <div 
            key={rocket.id} 
            className="border p-2 rounded-lg shadow-xl flex flex-col items-center bg-white"
          >
            {rocket.image && (
              <div className="mb-2 w-full h-32 relative overflow-hidden rounded-lg">
                <Image 
                  src={rocket.image} 
                  alt={rocket.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            )}
            <h2 className="text-sm font-semibold mb-1 text-black">{rocket.name}</h2>
            <p className="text-xs text-center mb-2 text-black">{rocket.description}</p>
            
            {/* Add race-specific details here */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Phaser Game Component */}
      {selectedRocketIds.length === 2 && (
        <div className="mt-4">
          <RocketRaceGame rocketIds={selectedRocketIds} />
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button 
          onClick={raceStatus === 'start' ? handleStartRace : handleJoinRace}
          disabled={raceLoading}
          className="
            bg-green-500 
            text-white 
            font-bold 
            py-2 px-4 
            rounded-full 
            text-sm
            hover:bg-green-600 
            transition-colors
            disabled:opacity-50
          "
        >
          {raceLoading 
            ? 'Starting Race...' 
            : (raceStatus === 'start' ? 'Start Race' : 'Join the Race')
          }
        </button>
      </div>

      {raceData && (
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">Race Results</h2>
          {raceData.startRace.winner ? (
            <p>
              Winner: {
                raceData.startRace.winner === raceData.startRace.rocket1.id 
                  ? selectedRockets.find(r => r.id === raceData.startRace.rocket1.id)?.name 
                  : selectedRockets.find(r => r.id === raceData.startRace.rocket2.id)?.name
              }
            </p>
          ) : (
            <div>
              <p>Race in Progress</p>
              <div className="flex justify-between">
                <div>
                  <p>Rocket 1 Progress: {raceData.startRace.rocket1.progress}%</p>
                  <p>Status: {raceData.startRace.rocket1.exploded ? 'Exploded' : 'Racing'}</p>
                </div>
                <div>
                  <p>Rocket 2 Progress: {raceData.startRace.rocket2.progress}%</p>
                  <p>Status: {raceData.startRace.rocket2.exploded ? 'Exploded' : 'Racing'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {raceError && (
        <div className="mt-4 text-center text-red-500">
          Error starting race: {raceError.message}
        </div>
      )}
    </div>
  );
}
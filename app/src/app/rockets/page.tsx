'use client';

import { useQuery } from '@apollo/client';
import { GET_ROCKETS } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function RocketsPage() {
  const { loading, error, data } = useQuery(GET_ROCKETS);
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);

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
      localStorage.setItem('selectedRockets', JSON.stringify(selectedRocketIds));
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
    // Placeholder for race launch logic
    console.log('Launching race with rockets:', selectedRockets);
    socket?.emit('launch-race', selectedRockets);
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
        </div>
      </div>
    </div>
  );
}
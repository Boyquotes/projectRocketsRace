'use client';

import { useQuery } from '@apollo/client';
import { GET_ROCKETS } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function RocketsPage() {
  const { loading, error, data } = useQuery(GET_ROCKETS);
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);

  useEffect(() => {
    // Load previously selected rockets from local storage on component mount
    const storedRockets = localStorage.getItem('selectedRockets');
    if (storedRockets) {
      setSelectedRockets(JSON.parse(storedRockets));
    }
  }, []);

  const handleRocketSelect = (rocketId: string) => {
    // Create a copy of current selected rockets
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

    // Update state and local storage
    setSelectedRockets(newSelectedRockets);
    localStorage.setItem('selectedRockets', JSON.stringify(newSelectedRockets));
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
    </div>
  );
}
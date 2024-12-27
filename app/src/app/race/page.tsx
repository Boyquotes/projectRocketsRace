'use client';

import { useQuery } from '@apollo/client';
import { GET_ROCKETS } from '@/graphql/queries';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RacePage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_ROCKETS);

  // Get selected rocket IDs from local storage or search params
  const [selectedRocketIds, setSelectedRocketIds] = useState<string[]>([]);

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
      <div className="grid grid-cols-2 gap-6">
        {selectedRockets.map((rocket: any) => (
          <div 
            key={rocket.id} 
            className="border p-4 rounded-lg shadow-xl flex flex-col items-center bg-white"
          >
            {rocket.image && (
              <div className="mb-4 w-full h-64 relative overflow-hidden rounded-lg">
                <Image 
                  src={rocket.image} 
                  alt={rocket.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{rocket.name}</h2>
            <p className="text-center mb-4">{rocket.description}</p>
            
            {/* Add race-specific details here */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: '0%' }}
              ></div>
            </div>
            
            <button 
              className="
                bg-green-500 
                text-white 
                font-bold 
                py-2 px-4 
                rounded-full 
                hover:bg-green-600 
                transition-colors
              "
            >
              Start Race
            </button>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <button 
          onClick={() => router.push('/rockets')}
          className="
            bg-gray-200 
            text-gray-800 
            font-bold 
            py-2 px-4 
            rounded-full 
            hover:bg-gray-300 
            transition-colors
          "
        >
          Back to Rockets
        </button>
      </div>
    </div>
  );
}
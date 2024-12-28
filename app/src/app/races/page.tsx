'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RACES } from '@/graphql/queries';
import Image from 'next/image';

export default function RacesPage() {
  const { loading, error, data } = useQuery(GET_RACES);

  if (loading) return <p>Loading races...</p>;
  if (error) return <p>Error loading races: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Race History</h1>
      {data.races.length === 0 ? (
        <p className="text-gray-500">No races have been run yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.races.map((race: any) => (
            <div 
              key={race.id} 
              className="bg-white shadow-lg rounded-lg overflow-hidden border"
            >
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 relative">
                      <Image 
                        src={race.rocket1.image} 
                        alt={race.rocket1.name} 
                        fill 
                        className="object-contain"
                      />
                    </div>
                    <span>VS</span>
                    <div className="w-16 h-16 relative">
                      <Image 
                        src={race.rocket2.image} 
                        alt={race.rocket2.name} 
                        fill 
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Race #{race.id}
                  </h2>
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(race.createdAt).toLocaleString()}
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium">Status:</span> {race.status}
                  </div>
                  
                  {race.winner && (
                    <div className="text-green-600 font-bold">
                      Winner: {race.winner.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RACES } from '@/graphql/queries';

export default function RacesPage() {
  const { loading, error, data } = useQuery(GET_RACES);

  if (loading) return <p>Loading races...</p>;
  if (error) return <p>Error loading races: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Race History</h1>
      {data.races.length === 0 ? (
        <p className="text-gray-900">No races have been run yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.races.map((race: any) => (
            <div 
              key={race.id} 
              className="bg-white shadow-lg rounded-lg overflow-hidden border p-4 text-black"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Race #{race.id}
                </h2>
                
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <div className="text-center">
                    <span className="block font-medium">Rocket : {race.rocket1.id}</span>
                    <span className="text-sm">
                      Progress: {race.rocket1.progress.toFixed(2)}%
                    </span>
                    {race.rocket1.exploded && (
                      <span className="text-red-500 block">Exploded</span>
                    )}
                  </div>
                  <span>VS</span>
                  <div className="text-center">
                    <span className="block font-medium">Rocket : {race.rocket2.id}</span>
                    <span className="text-sm">
                      Progress: {race.rocket2.progress.toFixed(2)}%
                    </span>
                    {race.rocket2.exploded && (
                      <span className="text-red-500 block">Exploded</span>
                    )}
                  </div>
                </div>
                
                {race.winner && (
                  <div className="text-green-600 font-bold">
                    Winner: Rocket {race.winner.id}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
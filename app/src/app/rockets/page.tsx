'use client';

import { useQuery } from '@apollo/client';
import { GET_ROCKETS } from '@/graphql/queries';
import Image from 'next/image';

export default function RocketsPage() {
  const { loading, error, data } = useQuery(GET_ROCKETS);

  if (loading) return <p>Loading rockets...</p>;
  if (error) return <p>Error loading rockets: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rockets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.rockets.map((rocket: any) => (
          <div key={rocket.id} className="border p-4 rounded-lg shadow-md flex flex-col items-center">
            {rocket.image && (
              <div className="mb-4 w-full h-48 relative">
                <Image 
                  src={rocket.image} 
                  alt={rocket.name} 
                  fill 
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{rocket.name}</h2>
            <p className="text-center">{rocket.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
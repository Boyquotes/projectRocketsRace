import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'graphql',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'graphql-node',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;

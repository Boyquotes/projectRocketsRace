import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['example.com', 'localhost'], // Add domains where rocket images are hosted
  },
};

export default nextConfig;

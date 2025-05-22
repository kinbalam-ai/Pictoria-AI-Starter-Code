/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next'

const nextConfig:NextConfig = {
  experimental: {
        serverActions: {
            bodySizeLimit: '3mb'
        }
    },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      // {
      //   protocol: "https",
      //   hostname: "hyuthkkrcqzymoqvitti.supabase.co", // Update this to your supabase url
      // },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // This covers all Supabase domains
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

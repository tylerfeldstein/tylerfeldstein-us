import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
  // Configure hostname rewrites for development
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverActions: {
        allowedOrigins: [
          'localhost:3000',
          'j1x2lm7s-3000.usw3.devtunnels.ms',
        ],
      },
    },
  }),
  // Production configuration
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      serverActions: {
        allowedOrigins: process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS?.split(',') || [],
      },
    },
  }),
};

export default nextConfig;

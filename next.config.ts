import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Whitelist images from the Gutenberg API!
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gutenberg.org',
        pathname: '/**', // Allow all image paths from this domain
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // For our fallback image
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;

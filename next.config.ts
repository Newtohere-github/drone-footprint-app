import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Allow map tile images from open sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cartocdn.com" },
      { protocol: "https", hostname: "**.maptiler.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
    ],
  },
  // Required for deck.gl / maplibre worker scripts
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;

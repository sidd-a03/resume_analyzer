import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: [process.env.IP_ADDRESS as string],
  images: {
    // profile pictures from the OAuth providers
    remotePatterns: [
      new URL("https://lh3.googleusercontent.com/**"),
      new URL("https://avatars.githubusercontent.com/**"),
    ],
  },
};

export default nextConfig;

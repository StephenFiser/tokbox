import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For server actions - allow larger video uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;

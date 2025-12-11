import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // For server actions - allow larger video uploads
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Allow larger request bodies through middleware (for video uploads)
    middlewareClientMaxBodySize: '100mb',
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Ensure static optimization works well
  trailingSlash: false,
  // Handle API routes properly
  serverExternalPackages: ['@google/genai']
};

export default nextConfig;

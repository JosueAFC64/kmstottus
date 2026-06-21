import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumentar límite de body para uploads grandes (100MB)
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;

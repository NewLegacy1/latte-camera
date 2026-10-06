import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is opened at 127.0.0.1 while Next's default allowed
  // origin is localhost. Without this, the client runtime never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/returns", destination: "/refund", permanent: true },
    ];
  },
};

export default nextConfig;

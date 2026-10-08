import type { NextConfig } from "next";

const shop = (process.env.SHOPIFY_STORE_DOMAIN || "edr0qi-9t.myshopify.com").replace(/^https?:\/\//, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The dev server is opened at 127.0.0.1 while Next's default allowed
  // origin is localhost. Without this, the client runtime never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/returns", destination: "/refund", permanent: true },
      // Shopify's order emails link tracking through the store domain; send them to the shop so "Track order" opens.
      { source: "/_t/:path*", destination: `https://${shop}/_t/:path*`, permanent: false },
    ];
  },
  async rewrites() {
    // Shopify's consent script calls the storefront's own GraphQL path on headless stores.
    return [{ source: "/api/unstable/graphql.json", destination: "/api/shopify-storefront" }];
  },
};

export default nextConfig;

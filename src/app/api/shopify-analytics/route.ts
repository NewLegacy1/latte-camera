import { NextResponse } from "next/server";
import { shopDomain } from "@/lib/ownlane";

function gid(type: string, value: string | undefined) {
  const raw = (value ?? "").trim();
  if (/^gid:\/\/shopify\//.test(raw)) return raw;
  const match = raw.match(/(\d+)\s*$/);
  return match ? `gid://shopify/${type}/${match[1]}` : "";
}

/** Public shop identity for the browser's Shopify Analytics bootstrap (src/lib/shopify-analytics.ts). */
export function GET() {
  return NextResponse.json(
    {
      ok: true,
      currency: "USD",
      acceptedLanguage: "EN",
      shopId: gid("Shop", process.env.SHOPIFY_SHOP_ID) || "gid://shopify/Shop/83149684959",
      shopDomain: shopDomain(),
      storefrontId: process.env.SHOPIFY_STOREFRONT_ID || "0",
      storefrontRootDomain: "dearlatte.shop",
      checkoutRootDomain: "checkout.dearlatte.shop",
      publicStorefrontToken: process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || "",
    },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}

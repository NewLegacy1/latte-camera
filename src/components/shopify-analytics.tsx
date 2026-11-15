"use client";

import { useEffect } from "react";
import { CURRENCY } from "@/lib/offer";

export function ShopifyAnalytics({ shop }: { shop: string }) {
  useEffect(() => {
    const domain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!domain) return;
    window.Shopify = window.Shopify || {};
    window.Shopify.shop = domain;
    window.Shopify.locale = "en";
    window.Shopify.currency = { active: CURRENCY, rate: "1.0" };
  }, [shop]);

  return null;
}

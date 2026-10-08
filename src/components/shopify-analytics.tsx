"use client";

import { useEffect } from "react";
import { packProducts } from "@/lib/offer";
import { startShopifyAnalytics } from "@/lib/shopify-analytics";

/** Starts Shopify Analytics on every page. Product pages report the default pack (Buy 2, Black). */
export function ShopifyAnalytics() {
  useEffect(() => {
    void startShopifyAnalytics(packProducts(2, "Black", false));
  }, []);

  return null;
}

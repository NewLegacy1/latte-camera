"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import { useEffect } from "react";
import { marketingPreference } from "./meta";

function syncConsent() {
  return new Promise<void>(resolve => {
    const apply = () => {
      const choice = localStorage.getItem(marketingPreference);
      if (choice === null) return;
      const allowed = choice === "yes";
      const privacy = window.Shopify?.customerPrivacy;
      if (!privacy) return;
      void privacy.setTrackingConsent({
        analytics: allowed, marketing: allowed, preferences: true, sale_of_data: allowed,
      }).then(() => resolve());
    };
    window.addEventListener(marketingPreference, apply);
    apply();
  });
}

export default function ShopifyAnalytics() {
  useEffect(() => {
    const analytics = window.Shopify?.analytics;
    if (analytics) analytics.publish("page_viewed");
  }, []);
  return <ShopifyScripts
    shop={{ shopId: "86287384795", storefrontId: "0", myshopifyDomain: "mnhkb0-af.myshopify.com" }}
    analytics={{ channel: "headless" }}
    consent={{ mode: "custom-banner", setup: syncConsent }}
    webMcp={false}
  />;
}

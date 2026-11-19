"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import { useEffect } from "react";

function syncConsent() {
  return new Promise<void>(resolve => {
    const privacy = window.Shopify?.customerPrivacy;
    if (!privacy) return resolve();
    void privacy.setTrackingConsent({
      analytics: true, marketing: true, preferences: true, sale_of_data: true,
    }).then(() => resolve());
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

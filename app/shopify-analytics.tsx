"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import { useEffect } from "react";

function syncConsent() {
  return new Promise<void>(resolve => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    const attempt = () => {
      const privacy = window.Shopify?.customerPrivacy;
      if (!privacy) return false;
      void privacy.setTrackingConsent({
        analytics: true, marketing: true, preferences: true, sale_of_data: true,
      }).then(done).catch(done);
      return true;
    };
    if (attempt()) return;
    const timer = window.setInterval(() => {
      if (attempt()) window.clearInterval(timer);
    }, 100);
    window.setTimeout(() => { window.clearInterval(timer); done(); }, 5000);
  });
}

export default function ShopifyAnalytics() {
  useEffect(() => {
    let tries = 0;
    const timer = window.setInterval(() => {
      const analytics = window.Shopify?.analytics;
      if (analytics) {
        analytics.publish("page_viewed");
        window.clearInterval(timer);
      } else if (++tries >= 50) {
        window.clearInterval(timer);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);
  return <ShopifyScripts
    shop={{ shopId: "86287384795", storefrontId: "0", myshopifyDomain: "mnhkb0-af.myshopify.com" }}
    analytics={{ channel: "headless" }}
    consent={{ mode: "custom-banner", setup: syncConsent }}
    webMcp={false}
  />;
}

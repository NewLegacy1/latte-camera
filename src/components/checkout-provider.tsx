"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useOffer } from "@/components/offer-provider";
import { dollars, packLines, packProducts, type AddonId } from "@/lib/offer";
import { shopifyTokens, trackShopifyCheckout } from "@/lib/shopify-analytics";
import { checkoutUrl, landingAttribution, metaAttribution, trackEvent, visitorId } from "@/lib/track-client";

type Status = "idle" | "loading" | "error";

type CheckoutValue = {
  buy: () => void;
  status: Status;
  error: string;
};

const CheckoutContext = createContext<CheckoutValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { tier, color, paidFrother, messageCard, giftMessage, totalCents } = useOffer();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const busy = useRef(false);

  const buy = useCallback(() => {
    if (busy.current) return;
    if (messageCard && giftMessage.trim().length < 2) {
      setStatus("error");
      setError("Write the card message, or leave the card off the order.");
      return;
    }

    busy.current = true;
    setStatus("loading");
    setError("");

    void (async () => {
      const addons: AddonId[] = [];
      if (paidFrother) addons.push("milk-frother-wand");
      if (messageCard) addons.push("custom-message-card");

      const contents = packLines(tier, color, paidFrother).map((line) => ({ id: line.variantId, quantity: line.quantity }));
      const value = dollars(totalCents);
      // Shared with Ownlane, so Meta counts the storefront's InitiateCheckout and Ownlane's as one.
      const initiateEventId = `ic-${crypto.randomUUID()}`;
      const shopify = await shopifyTokens();

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier,
            color,
            addons,
            visitorId: visitorId(),
            attribution: {
              ...metaAttribution(),
              ...landingAttribution(),
              metaInitiateEventId: initiateEventId,
              shopifyUniqueToken: shopify.uniqueToken,
              shopifyVisitToken: shopify.visitToken,
              shopifyShopId: shopify.shopId,
              shopifyStorefrontId: shopify.storefrontId,
            },
          }),
        });
        const data = (await response.json()) as { checkoutUrl?: string; cartId?: string | null; error?: string };
        if (!response.ok || !data.checkoutUrl?.startsWith("https://")) {
          busy.current = false;
          setStatus("error");
          setError(data.error || "Checkout didn't open. Try the button again.");
          return;
        }

        void trackEvent({ eventName: "AddToCart", eventId: crypto.randomUUID(), value, contents });
        void trackEvent({ eventName: "InitiateCheckout", eventId: initiateEventId, value, contents });
        await trackShopifyCheckout(packProducts(tier, color, paidFrother), data.cartId ?? "");
        window.location.assign(checkoutUrl(data.checkoutUrl));
      } catch {
        busy.current = false;
        setStatus("error");
        setError("Checkout didn't open. Try the button again.");
      }
    })();
  }, [color, giftMessage, messageCard, paidFrother, tier, totalCents]);

  return <CheckoutContext.Provider value={{ buy, status, error }}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const value = useContext(CheckoutContext);
  if (!value) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }
  return value;
}

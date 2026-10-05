"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useOffer } from "@/components/offer-provider";
import { HANDLES, dollars, type AddonId } from "@/lib/offer";
import { attributionAttributes, trackEvent } from "@/lib/track-client";

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

      const contentIds: string[] = [HANDLES.press];
      if (tier === 2 || tier === 3) contentIds.push(HANDLES.refill);
      if (tier === 3 || paidFrother) contentIds.push(HANDLES.frother);
      if (messageCard) contentIds.push(HANDLES.messageCard);

      const value = dollars(totalCents);
      const numItems = contentIds.length;
      const attributes = attributionAttributes();
      const note = giftMessage.trim();
      if (messageCard && note) {
        attributes.push({ key: "gift_message", value: note.slice(0, 200) });
      }

      try {
        await trackEvent({
          eventName: "AddToCart",
          eventId: crypto.randomUUID(),
          value,
          contentIds,
          numItems,
        });

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier, color, addons, attributes }),
        });
        const data = (await response.json()) as { checkoutUrl?: string; error?: string };
        if (!response.ok || !data.checkoutUrl?.startsWith("https://")) {
          busy.current = false;
          setStatus("error");
          setError(data.error || "Checkout didn't open. Try the button again.");
          return;
        }

        await trackEvent({
          eventName: "InitiateCheckout",
          eventId: crypto.randomUUID(),
          value,
          contentIds,
          numItems,
        });
        window.location.assign(data.checkoutUrl);
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

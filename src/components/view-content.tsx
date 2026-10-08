"use client";

import { useEffect } from "react";
import { PRICE, VARIANTS, dollars } from "@/lib/offer";
import { trackEvent } from "@/lib/track-client";

export function ViewContent() {
  useEffect(() => {
    void trackEvent({
      eventName: "ViewContent",
      eventId: crypto.randomUUID(),
      value: dollars(PRICE.tier[2]),
      contents: [{ id: VARIANTS.colors.Black, quantity: 1 }],
    });
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";
import { HANDLES, PRICE, dollars } from "@/lib/offer";
import { trackEvent } from "@/lib/track-client";

export function ViewContent() {
  useEffect(() => {
    void trackEvent({
      eventName: "ViewContent",
      eventId: crypto.randomUUID(),
      value: dollars(PRICE.tier[2]),
      contentIds: [HANDLES.press],
      numItems: 1,
    });
  }, []);
  return null;
}

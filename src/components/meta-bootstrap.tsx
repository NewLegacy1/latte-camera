"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/track-client";

export function MetaBootstrap() {
  useEffect(() => {
    void trackEvent({ eventName: "PageView", eventId: crypto.randomUUID() });
  }, []);
  return null;
}

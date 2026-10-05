"use client";

type TrackName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";

type TrackInput = {
  eventName: TrackName;
  eventId: string;
  value?: string;
  contentIds?: string[];
  numItems?: number;
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    Shopify?: {
      shop?: string;
      locale?: string;
      currency?: { active: string; rate: string };
    };
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const once = new Set<TrackName>();

function installPixel() {
  if (!PIXEL_ID || typeof window === "undefined" || window.fbq) return;
  const fbq = function (this: Fbq, ...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", PIXEL_ID);
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function attributionAttributes() {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid") ?? "";
  let fbc = readCookie("_fbc");
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${encodeURIComponent(fbc)}; Path=/; Max-Age=7776000; SameSite=Lax`;
  }
  const pairs: [string, string][] = [
    ["_fbp", readCookie("_fbp")],
    ["_fbc", fbc],
    ["fbclid", fbclid],
    ["utm_source", params.get("utm_source") ?? ""],
    ["utm_medium", params.get("utm_medium") ?? ""],
    ["utm_campaign", params.get("utm_campaign") ?? ""],
    ["utm_content", params.get("utm_content") ?? ""],
    ["utm_term", params.get("utm_term") ?? ""],
  ];
  return pairs.filter(([, value]) => value.length > 0).map(([key, value]) => ({ key, value }));
}

export async function trackEvent(input: TrackInput) {
  if (input.eventName === "PageView" || input.eventName === "ViewContent") {
    if (once.has(input.eventName)) return;
    once.add(input.eventName);
  }

  installPixel();

  const custom: Record<string, unknown> = {};
  if (input.value) {
    custom.value = Number(input.value);
    custom.currency = "USD";
  }
  if (input.contentIds?.length) {
    custom.content_ids = input.contentIds;
    custom.content_type = "product";
    custom.contents = input.contentIds.map((id) => ({ id, quantity: 1 }));
    custom.num_items = input.numItems ?? input.contentIds.length;
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq("track", input.eventName, custom, { eventID: input.eventId });
  }

  const cookies = attributionAttributes();
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: input.eventName,
        eventId: input.eventId,
        eventSourceUrl: window.location.href,
        value: input.value,
        contentIds: input.contentIds,
        numItems: input.numItems,
        fbp: cookies.find((item) => item.key === "_fbp")?.value,
        fbc: cookies.find((item) => item.key === "_fbc")?.value,
      }),
      keepalive: true,
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // Tracking never blocks the page or the hop to Shopify.
  }
}

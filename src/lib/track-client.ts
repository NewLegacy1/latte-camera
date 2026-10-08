"use client";

type TrackName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";

type TrackInput = {
  eventName: TrackName;
  eventId: string;
  value?: string;
  contents?: { id: string; quantity: number }[];
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
      customerPrivacy?: unknown;
      loadFeatures?: (features: { name: string; version: string }[], callback: () => void) => void;
    };
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const COOKIE_PARENT = "dearlatte.shop";
const VISITOR_COOKIE = "dl_vid";
const LANDING_KEY = "dl-first-landing";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
const once = new Set<TrackName>();

function cookieDomain() {
  const host = window.location.hostname;
  return host === COOKIE_PARENT || host.endsWith(`.${COOKIE_PARENT}`) ? COOKIE_PARENT : "";
}

function writeCookie(name: string, value: string, maxAge: number) {
  let entry = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  if (window.location.protocol === "https:") entry += "; Secure";
  const domain = cookieDomain();
  if (domain) entry += `; Domain=${domain}`;
  document.cookie = entry;
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** One id per browser, sent hashed as Meta's external_id here and by Ownlane, so browsing and buying link to one person. */
export function visitorId() {
  if (typeof window === "undefined") return "";
  let id = readCookie(VISITOR_COOKIE);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) id = crypto.randomUUID();
  writeCookie(VISITOR_COOKIE, id, 31536000);
  return id;
}

/**
 * The first page of this visit (path + utm_* only) and the external site that sent the shopper.
 * A visit ends after 30 minutes without a page view, like Shopify's sessions.
 */
export function landingAttribution() {
  if (typeof window === "undefined") return { landingUrl: "", referrer: "" };
  const now = Date.now();
  let visit: { url?: unknown; referrer?: unknown; seen?: unknown } | null = null;
  try {
    visit = JSON.parse(sessionStorage.getItem(LANDING_KEY) || "null");
  } catch {}
  if (!visit || typeof visit.url !== "string" || typeof visit.seen !== "number" || now < visit.seen || now - visit.seen > 30 * 60 * 1000) {
    const query = new URLSearchParams();
    const params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) query.set(key, value.slice(0, 150));
    });
    let referrer = "";
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      const own = window.location.hostname.replace(/^www\./, "");
      if (host !== own && !host.endsWith(`.${own}`) && !own.endsWith(`.${host}`)) referrer = host;
    } catch {}
    const search = query.toString();
    visit = { url: window.location.origin + window.location.pathname + (search ? `?${search}` : ""), referrer };
  }
  visit.seen = now;
  try {
    sessionStorage.setItem(LANDING_KEY, JSON.stringify(visit));
  } catch {}
  return { landingUrl: String(visit.url), referrer: typeof visit.referrer === "string" ? visit.referrer : "" };
}

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
  window.fbq("init", PIXEL_ID, { external_id: visitorId().toLowerCase() });
}

/** Meta click data for checkout. Persists fbclid as _fbc so it survives later pages. */
export function metaAttribution() {
  if (typeof window === "undefined") return { fbp: "", fbc: "", fbclid: "" };
  const fbclid = new URLSearchParams(window.location.search).get("fbclid") ?? "";
  let fbc = readCookie("_fbc");
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    writeCookie("_fbc", encodeURIComponent(fbc), 7776000);
  }
  return { fbp: readCookie("_fbp"), fbc, fbclid };
}

/** Carries this page's utm_* (or the landing page's) onto the checkout link, so Ownlane can still attribute it. */
export function checkoutUrl(raw: string) {
  const url = new URL(raw, window.location.origin);
  const live = new URLSearchParams(window.location.search);
  let landing = new URLSearchParams();
  try {
    landing = new URL(landingAttribution().landingUrl).searchParams;
  } catch {}
  UTM_KEYS.forEach((key) => {
    const value = live.get(key) || landing.get(key);
    if (value && !url.searchParams.get(key)) url.searchParams.set(key, value);
  });
  return url.toString();
}

export async function trackEvent(input: TrackInput) {
  if (input.eventName === "PageView" || input.eventName === "ViewContent") {
    if (once.has(input.eventName)) return;
    once.add(input.eventName);
  }

  installPixel();
  landingAttribution();

  const custom: Record<string, unknown> = {};
  if (input.value) {
    custom.value = Number(input.value);
    custom.currency = "USD";
  }
  if (input.contents?.length) {
    custom.content_ids = input.contents.map((item) => item.id);
    custom.content_type = "product";
    custom.contents = input.contents;
    custom.num_items = input.contents.reduce((sum, item) => sum + item.quantity, 0);
  }

  if (window.fbq && PIXEL_ID) {
    window.fbq("track", input.eventName, custom, { eventID: input.eventId });
  }

  const meta = metaAttribution();
  const body = JSON.stringify({
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: window.location.href,
    value: input.value,
    contents: input.contents,
    fbp: meta.fbp || undefined,
    fbc: meta.fbc || undefined,
    visitorId: visitorId() || undefined,
  });
  // Send now: the checkout button navigates away, so a delayed copy would never leave.
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // Tracking never blocks the page or the hop to checkout.
  }
}
